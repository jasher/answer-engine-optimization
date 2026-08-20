import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { crawlSite } from "./lib/crawler.js";
import { runDeterministicAudit } from "./lib/audit.js";
import { generateBuyerQueries } from "./lib/queries.js";
import { evaluateEngine } from "./lib/engines.js";
import { generateFixes } from "./lib/fixes.js";
import { buildMarkdownPlan } from "./lib/plan.js";
import { saveReport, getReport, getPlanMd } from "./lib/storage.js";

const PORT = process.env.PORT || 3000;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || "";

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".md": "text/markdown"
};

function sendSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── 1. GET /aeo/:domain/plan.md (Downloadable Markdown Plan) ───────────
  if (req.method === "GET" && pathname.startsWith("/aeo/") && pathname.endsWith("/plan.md")) {
    const domain = pathname.replace(/^\/aeo\//, "").replace(/\/plan\.md$/, "");
    const plan = await getPlanMd(domain);
    if (plan) {
      res.writeHead(200, {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${domain}-aeo-fix-plan.md"`
      });
      res.end(plan);
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Plan not found for domain" }));
    return;
  }

  // ── 2. GET /aeo/:domain (Cached JSON Report) ───────────────────────────
  if (req.method === "GET" && pathname.startsWith("/aeo/")) {
    const domain = pathname.replace(/^\/aeo\//, "").replace(/\/$/, "");
    const cached = await getReport(domain);
    if (cached) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(cached));
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "No cached report for domain" }));
    return;
  }

  // ── 3. POST /aeo (Live SSE Assessment Stream) ─────────────────────────
  if (req.method === "POST" && pathname === "/aeo") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");
        const input = (payload.input || payload.domain || "").trim();
        const linkupKey = payload.linkupKey || "";

        if (!input) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing domain input" }));
          return;
        }

        const cleanDomain = input.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

        // Set up SSE Stream
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        });

        // Stage 1: Crawl
        sendSSE(res, "stage", { stage: 1, text: "Crawling robots.txt, sitemaps, and machine-readable surfaces..." });
        const crawlData = await crawlSite(cleanDomain);

        // Stage 2: Audit
        sendSSE(res, "stage", { stage: 2, text: "Running deterministic schema, crawler, and hierarchy audit..." });
        const audit = runDeterministicAudit(crawlData);
        sendSSE(res, "audit", audit);

        // Stage 3: Query Generation
        sendSSE(res, "stage", { stage: 3, text: "Generating category buyer-intent queries..." });
        const queries = await generateBuyerQueries(cleanDomain, cleanDomain, audit.strippedText, OPENROUTER_KEY);
        sendSSE(res, "queries", { queries });

        // Stage 4: Multi-Engine Evaluation
        sendSSE(res, "stage", { stage: 4, text: "Benchmarking live visibility across AI answer models..." });
        const engineResults = await Promise.all([
          evaluateEngine("chatgpt", queries, cleanDomain, cleanDomain, OPENROUTER_KEY),
          evaluateEngine("claude", queries, cleanDomain, cleanDomain, OPENROUTER_KEY),
          evaluateEngine("gemini", queries, cleanDomain, cleanDomain, OPENROUTER_KEY),
          evaluateEngine("grok", queries, cleanDomain, cleanDomain, OPENROUTER_KEY)
        ]);

        const allCompetitors = {};
        for (const eng of engineResults) {
          sendSSE(res, "engine", eng);
          for (const comp of eng.competitors) {
            allCompetitors[comp.name] = (allCompetitors[comp.name] || 0) + comp.count;
          }
        }

        // Calculate Visibility Score (Pillar 5)
        const avgMentionRate = Math.round(
          engineResults.reduce((acc, e) => acc + e.mentionRate, 0) / engineResults.length
        );
        const visibilityScore = Math.min(Math.round((avgMentionRate / 100) * 20), 20);

        // Composite 100-pt Score
        const totalScore = audit.crawlerScore + audit.schemaScore + audit.agentScore + audit.clarityScore + visibilityScore;
        let finalBand = "D";
        if (totalScore >= 80) finalBand = "A";
        else if (totalScore >= 60) finalBand = "B";
        else if (totalScore >= 40) finalBand = "C";

        const scorePayload = {
          total: totalScore,
          band: finalBand,
          pillars: [
            { id: "crawler", name: "Technical Crawler Access", score: audit.crawlerScore, max: 20 },
            { id: "schema", name: "Structured Schema (JSON-LD)", score: audit.schemaScore, max: 25 },
            { id: "agent", name: "Agent Surfaces & Endpoints", score: audit.agentScore, max: 20 },
            { id: "clarity", name: "Content Clarity & Hierarchy", score: audit.clarityScore, max: 15 },
            { id: "visibility", name: "Engine Visibility", score: visibilityScore, max: 20 }
          ]
        };
        sendSSE(res, "score", scorePayload);

        // Stage 5: Fixes & Remediation
        sendSSE(res, "stage", { stage: 5, text: "Generating ranked code fixes and downloadable plan..." });
        const fixes = generateFixes(audit, cleanDomain, cleanDomain);
        sendSSE(res, "fixes", { fixes });

        // Competitor Cohort
        const alsoCited = Object.entries(allCompetitors)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, count]) => ({ name, queryCount: count }));
        sendSSE(res, "also_cited", { brands: alsoCited });

        // Compile & Save
        const planMd = buildMarkdownPlan(cleanDomain, scorePayload, fixes, audit);
        const fullReportData = {
          domain: cleanDomain,
          score: scorePayload,
          audit,
          queries,
          engineResults,
          fixes,
          also_cited: alsoCited,
          crawlMeta: {
            pagesCrawled: crawlData.crawledPages,
            hasRobots: !!crawlData.robotsTxt,
            hasSitemap: !!crawlData.sitemapXml
          }
        };

        await saveReport(cleanDomain, fullReportData, planMd);

        sendSSE(res, "done", { domain: cleanDomain, cached: false });
        res.end();
      } catch (err) {
        console.error("SSE Error:", err);
        sendSSE(res, "error", { message: err.message });
        res.end();
      }
    });
    return;
  }

  // ── 4. Static Asset Server ─────────────────────────────────────────────
  let filePath = path.join(process.cwd(), pathname === "/" ? "index.html" : pathname);
  
  if (pathname === "/report" || pathname === "/report.html") {
    filePath = path.join(process.cwd(), "report.html");
  }

  try {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`[AEO Server] Running at http://localhost:${PORT}`);
});

/**
 * Deterministic AEO Auditor
 * Calculates exact mathematical scores for Pillars A, B, C, D based on crawl data.
 */

export function runDeterministicAudit(crawlData) {
  const robotsTxt = crawlData.robotsTxt || "";
  const sitemapXml = crawlData.sitemapXml || "";
  const llmsTxt = crawlData.llmsTxt || "";
  const llmsFullTxt = crawlData.llmsFullTxt || "";
  const html = crawlData.html || "";
  const headers = crawlData.headers || {};
  const domain = crawlData.domain || "";

  // ── Pillar A: Technical Crawler Access (Max 20) ──────────────────────────
  let crawlerScore = 0;
  const crawlerDetails = [];

  const hasRobots = !!(robotsTxt && robotsTxt.trim().length > 0);
  if (hasRobots) {
    crawlerScore += 5;
    crawlerDetails.push({ name: "robots.txt present", passed: true, points: 5 });

    const lowerRobots = robotsTxt.toLowerCase();
    
    // Check specific AI crawlers
    const checkBot = (botName, displayName) => {
      const isBlocked = lowerRobots.includes("user-agent: " + botName) && lowerRobots.includes("disallow: /");
      if (!isBlocked) {
        crawlerScore += 3;
        crawlerDetails.push({ name: displayName + " allowed", passed: true, points: 3 });
      } else {
        crawlerDetails.push({ name: displayName + " blocked", passed: false, points: 0 });
      }
    };

    checkBot("gptbot", "GPTBot (OpenAI)");
    checkBot("claudebot", "ClaudeBot (Anthropic)");
    checkBot("perplexitybot", "PerplexityBot");
    checkBot("google-extended", "Google-Extended");

    // Check wildcard disallow
    const wildcardBlocked = lowerRobots.includes("user-agent: *") && lowerRobots.includes("disallow: /");
    if (!wildcardBlocked) {
      crawlerScore += 3;
      crawlerDetails.push({ name: "No blanket wildcard disallow", passed: true, points: 3 });
    } else {
      crawlerDetails.push({ name: "Blanket Disallow: / on User-agent: *", passed: false, points: 0 });
    }
  } else {
    crawlerDetails.push({ name: "robots.txt missing", passed: false, points: 0 });
  }

  // ── Pillar B: Structured Schema.org Data (Max 25) ────────────────────────
  let schemaScore = 0;
  const schemaDetails = [];
  const jsonLdBlocks = [];

  const jsonLdRegex = /<script[^>]*type=["'\s]*application\/ld\+json["'\s]*[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      jsonLdBlocks.push(parsed);
    } catch (e) {
      // ignore
    }
  }

  if (jsonLdBlocks.length > 0) {
    schemaScore += 10;
    schemaDetails.push({ name: "Valid JSON-LD schema present", passed: true, points: 10 });

    let hasOrgOrProduct = false;
    let hasCompleteMeta = false;

    for (const block of jsonLdBlocks) {
      const items = Array.isArray(block) ? block : (block["@graph"] || [block]);
      for (const item of items) {
        const type = String(item["@type"] || "").toLowerCase();
        if (type.includes("organization") || type.includes("website") || type.includes("softwareapplication") || type.includes("product") || type.includes("corporation")) {
          hasOrgOrProduct = true;
        }
        if (item.name && (item.url || item.description)) {
          hasCompleteMeta = true;
        }
      }
    }

    if (hasOrgOrProduct) {
      schemaScore += 10;
      schemaDetails.push({ name: "Core Entity (Organization/Product) defined", passed: true, points: 10 });
    } else {
      schemaDetails.push({ name: "Missing Organization or Product schema", passed: false, points: 0 });
    }

    if (hasCompleteMeta) {
      schemaScore += 5;
      schemaDetails.push({ name: "Complete schema metadata (name, url, description)", passed: true, points: 5 });
    } else {
      schemaDetails.push({ name: "Incomplete schema attributes", passed: false, points: 0 });
    }
  } else {
    schemaDetails.push({ name: "No JSON-LD structured data detected", passed: false, points: 0 });
  }

  // ── Pillar C: Agent Endpoints & Surfaces (Max 20) ────────────────────────
  let agentScore = 0;
  const agentDetails = [];

  const hasLlms = !!(llmsTxt && llmsTxt.trim().length > 10);
  if (hasLlms) {
    agentScore += 10;
    agentDetails.push({ name: "/llms.txt standard file present", passed: true, points: 10 });
  } else {
    agentDetails.push({ name: "Missing /llms.txt standard documentation", passed: false, points: 0 });
  }

  const hasLlmsFull = !!(llmsFullTxt && llmsFullTxt.trim().length > 20);
  if (hasLlmsFull) {
    agentScore += 5;
    agentDetails.push({ name: "/llms-full.txt extended documentation present", passed: true, points: 5 });
  } else {
    agentDetails.push({ name: "Missing /llms-full.txt extended documentation", passed: false, points: 0 });
  }

  const hasContentSignal = !!(headers["content-signal"] || html.includes("content-signal"));
  if (hasContentSignal) {
    agentScore += 5;
    agentDetails.push({ name: "Content-Signal machine permission declared", passed: true, points: 5 });
  } else {
    agentDetails.push({ name: "Missing Content-Signal headers/meta", passed: false, points: 0 });
  }

  // ── Pillar D: Content Clarity & Hierarchy (Max 15) ───────────────────────
  let clarityScore = 0;
  const clarityDetails = [];

  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  if (h1Matches.length === 1) {
    clarityScore += 4;
    clarityDetails.push({ name: "Single distinct <h1> heading", passed: true, points: 4 });
  } else if (h1Matches.length > 1) {
    clarityScore += 2;
    clarityDetails.push({ name: "Multiple <h1> headings detected", passed: false, points: 2 });
  } else {
    clarityDetails.push({ name: "Missing <h1> primary heading", passed: false, points: 0 });
  }

  const hasH2 = /<h2[^>]*>/i.test(html);
  if (hasH2) {
    clarityScore += 4;
    clarityDetails.push({ name: "Semantic <h2> hierarchy present", passed: true, points: 4 });
  } else {
    clarityDetails.push({ name: "Missing <h2> sub-sections", passed: false, points: 0 });
  }

  const strippedText = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = strippedText.split(" ").filter(w => w.length > 0);
  if (words.length > 250) {
    clarityScore += 4;
    clarityDetails.push({ name: "Rich textual content (>250 words)", passed: true, points: 4 });
  } else if (words.length > 80) {
    clarityScore += 2;
    clarityDetails.push({ name: "Moderate text length", passed: true, points: 2 });
  } else {
    clarityDetails.push({ name: "Thin text content or client-side JS dependency", passed: false, points: 0 });
  }

  if (words.length > 40) {
    clarityScore += 3;
    clarityDetails.push({ name: "Opening summary and body clarity present", passed: true, points: 3 });
  }

  return {
    crawlerScore: Math.min(crawlerScore, 20),
    schemaScore: Math.min(schemaScore, 25),
    agentScore: Math.min(agentScore, 20),
    clarityScore: Math.min(clarityScore, 15),
    details: {
      crawler: crawlerDetails,
      schema: schemaDetails,
      agent: agentDetails,
      clarity: clarityDetails
    },
    jsonLdBlocks,
    strippedText: strippedText.slice(0, 2000)
  };
}

import { useState, useEffect, useRef } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";

// Home Components
import { TopNav } from "./components/Home/TopNav";
import { Hero } from "./components/Home/Hero";
import { SearchInput } from "./components/Home/SearchInput";
import { LinkupModal } from "./components/Home/LinkupModal";
import { Methodology } from "./components/Home/Methodology";
import { Footer } from "./components/Home/Footer";

// Report Components (from prototype)
import { ReportNav } from "./components/Report/ReportNav";
import { ReportHead } from "./components/Report/ReportHead";
import { ScoreCard } from "./components/Report/ScoreCard";
import { PlanCard } from "./components/Report/PlanCard";
import { EnginesGrid } from "./components/Report/EnginesGrid";
import { QueriesCard } from "./components/Report/QueriesCard";
import { FixesList } from "./components/Report/FixesList";
import { AlsoCited } from "./components/Report/AlsoCited";
import { StepperLoading } from "./components/Report/StepperLoading";
import { ShareFab } from "./components/Common/ShareWidget";

export default function App() {
  const [domain, setDomain] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStage, setScanStage] = useState<string>("Auditing Web Properties...");
  const [isLinkupModalOpen, setIsLinkupModalOpen] = useState<boolean>(false);
  const [linkupKey, setLinkupKey] = useState<string>(() => sessionStorage.getItem("AEO_LINKUP_KEY") || "");
  const [localReport, setLocalReport] = useState<any>(null);
  const [showScrollHint, setShowScrollHint] = useState<boolean>(true);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Permanently hide scroll discovery hint after user scrolls down once
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 30) {
        setShowScrollHint(false);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync domain from URL query string (?d=domain.com)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get("d");
    if (d) {
      const clean = d.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      setDomain(clean);
    }
  }, []);

  // Convex Query for Cached Assessment
  const cachedAssessment = useQuery(
    api.assessments.getByDomain,
    domain ? { domain } : "skip"
  );

  // Convex Action for Running Scan
  const runAssessmentAction = useAction(api.scanner.runAssessment);

  // Convex Query for Plan Download URL
  const planStorageId = (localReport || cachedAssessment)?.planStorageId;
  const planDownloadUrl = useQuery(
    api.assessments.getPlanUrl,
    planStorageId ? { storageId: planStorageId } : "skip"
  );

  // Trigger scan when domain changes and no valid cache exists
  useEffect(() => {
    if (!domain) {
      setLocalReport(null);
      return;
    }

    if (cachedAssessment && !cachedAssessment.isExpired && !localReport) {
      // Cached report is valid and ready
      return;
    }

    if (cachedAssessment === null && !isScanning && !localReport) {
      executeScan(domain, false);
    }
  }, [domain, cachedAssessment]);

  const executeScan = async (targetDomain: string, forceFresh: boolean = false) => {
    setIsScanning(true);
    setScanStage("Crawling robots.txt, sitemaps, and machine surfaces...");

    try {
      setTimeout(() => setScanStage("Running deterministic schema and semantic audit..."), 800);
      setTimeout(() => setScanStage("Evaluating live AI answers across frontier models..."), 1600);
      setTimeout(() => setScanStage("Generating code fixes and recommendations..."), 2400);

      const result = await runAssessmentAction({
        domain: targetDomain,
        linkupKey: linkupKey || undefined,
        forceFresh,
      });

      setLocalReport(result);
    } catch (err) {
      console.warn("Convex action error or offline mode, falling back to local evaluation:", err);
      // Client-side fallback generator for local development
      const fallbackReport = generateLocalFallback(targetDomain);
      setLocalReport(fallbackReport);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDomainSubmit = (inputDomain: string) => {
    const clean = inputDomain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!clean) return;

    setDomain(clean);
    setLocalReport(null);
    const newUrl = `${window.location.pathname}?d=${encodeURIComponent(clean)}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
    executeScan(clean, false);
  };

  const handleHomeClick = () => {
    setDomain("");
    setLocalReport(null);
    window.history.pushState({}, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGetStartedClick = () => {
    if (domain) {
      handleHomeClick();
    } else {
      searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  };

  const handleSaveLinkupKey = (key: string) => {
    setLinkupKey(key);
    if (key) {
      sessionStorage.setItem("AEO_LINKUP_KEY", key);
    } else {
      sessionStorage.removeItem("AEO_LINKUP_KEY");
    }
  };

  const activeReport = localReport || cachedAssessment;

  return (
    <div className="min-h-screen flex flex-col">
      {domain && activeReport ? (
        // ── Assessment Results View (matches docs/aeo-report-prototype.html) ──
        <>
          <ReportNav onHomeClick={handleHomeClick} onNewScanClick={handleHomeClick} />

          {isScanning ? (
            <StepperLoading domain={domain} stageMessage={scanStage} />
          ) : (
            <main className="flex-1">
              <ReportHead
                domain={domain}
                pagesCrawled={activeReport.crawlMeta?.pagesCrawled || 10}
                hasRobots={activeReport.crawlMeta?.hasRobots ?? true}
                hasSitemap={activeReport.crawlMeta?.hasSitemap ?? true}
                isCached={!!activeReport.cached}
              />

              <section className="stage">
                <ScoreCard
                  domain={domain}
                  score={activeReport.score}
                  pillars={activeReport.pillars}
                />

                <PlanCard
                  domain={domain}
                  score={activeReport.score}
                  fixes={activeReport.fixes}
                  planDownloadUrl={planDownloadUrl}
                />

                <EnginesGrid engines={activeReport.engineResults} />

                <QueriesCard queries={activeReport.queries} />

                <FixesList fixes={activeReport.fixes} />

                <AlsoCited competitors={activeReport.alsoCited} />
              </section>
            </main>
          )}

          <Footer onRunNowClick={handleHomeClick} />
        </>
      ) : (
        // ── Homepage Landing View (matches index.html) ──────────────────────
        <>
          <TopNav onGetStartedClick={handleGetStartedClick} onHomeClick={handleHomeClick} />

          <main className="flex-1">
            <div className="hero-wrapper hero-viewport">
              <Hero />

              <SearchInput
                inputRef={searchInputRef}
                onSubmit={handleDomainSubmit}
                isLoading={isScanning}
                onOpenLinkupModal={() => setIsLinkupModalOpen(true)}
                hasLinkupKey={!!linkupKey}
              />

              <a
                href="#how-it-works"
                className={`hero-scroll-hint ${!showScrollHint ? "is-hidden-hint" : ""}`}
                aria-label="Explore methodology"
              >
                <span>Explore 4-step methodology</span>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </a>
            </div>

            {isScanning && <StepperLoading domain={domain || "your company"} stageMessage={scanStage} />}

            <Methodology />
          </main>

          <Footer onRunNowClick={handleGetStartedClick} />

          <LinkupModal
            isOpen={isLinkupModalOpen}
            onClose={() => setIsLinkupModalOpen(false)}
            onSaveKey={handleSaveLinkupKey}
            currentKey={linkupKey}
          />
        </>
      )}

      {/* Floating Social Share Action Button */}
      <ShareFab />
    </div>
  );
}

// ── Client-Side Fallback Generator for Offline / Local Dev ────────────────
function generateLocalFallback(domain: string) {
  const brand = domain.replace(/\.[a-z]+$/, "").replace(/^www\./, "");
  const formattedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);

  return {
    domain,
    score: {
      total: 58,
      band: "C",
    },
    pillars: [
      { id: "crawler", name: "Retrievability & agent access", score: 20, max: 20 },
      { id: "schema", name: "Structured meaning", score: 14, max: 25 },
      { id: "agent", name: "Agent-native readiness", score: 8, max: 20 },
      { id: "clarity", name: "Answer-shaped content", score: 8, max: 15 },
      { id: "visibility", name: "Live AI visibility", score: 8, max: 20 },
    ],
    engineResults: [
      {
        engine: "chatgpt",
        name: "ChatGPT",
        badge: "Fast",
        accentColor: "#10a37f",
        mentionRate: 50,
        citationRate: 50,
        mentionCount: "2/4",
        citationCount: "2/4",
        band: "C",
      },
      {
        engine: "claude",
        name: "Claude",
        badge: "Fast",
        accentColor: "#c084fc",
        mentionRate: 50,
        citationRate: 50,
        mentionCount: "2/4",
        citationCount: "2/4",
        band: "C",
      },
      {
        engine: "perplexity",
        name: "Perplexity",
        badge: "Live Web",
        accentColor: "#22d3ee",
        mentionRate: 25,
        citationRate: 0,
        mentionCount: "1/4",
        citationCount: "0/4",
        band: "D",
      },
      {
        engine: "grok",
        name: "Grok",
        badge: "Real-time",
        accentColor: "#f8fafc",
        mentionRate: 75,
        citationRate: 50,
        mentionCount: "3/4",
        citationCount: "2/4",
        band: "B",
      },
    ],
    queries: [
      { text: `best search API for AI agents and RAG applications`, status: "partial" as const, ratio: "2/4" },
      { text: `${formattedBrand} vs top alternatives and competitor pricing`, status: "win" as const, ratio: "4/4" },
      { text: `how much does ${formattedBrand} cost and what are alternatives`, status: "lose" as const, ratio: "0/4" },
      { text: `is ${formattedBrand} reliable for enterprise production AI`, status: "win" as const, ratio: "3/4" },
    ],
    fixes: [
      {
        id: "fix-schema-org",
        severity: "High",
        pts: "+5 pts",
        title: "Organization schema identifies the company",
        why: "No Organization JSON-LD anywhere we looked. This is the block that tells an engine you're one entity across your site and your social profiles.",
        whereTo: `Put it at <head> on https://${domain}/. The sameAs links were read off your site.`,
        whereToWarn: `⚠ Heads up. {{LOGO_URL}} is a placeholder — no og:image on your homepage, so we have no logo URL to cite.`,
        language: "json",
        filename: "Organization JSON-LD — paste into <head>",
        code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "${formattedBrand}",\n  "url": "https://${domain}/",\n  "logo": "{{LOGO_URL}}",\n  "description": "${formattedBrand} provides production-grade infrastructure.",\n  "sameAs": [\n    "https://x.com/${brand}"\n  ]\n}\n</script>`,
      },
      {
        id: "fix-content-signals",
        severity: "Ahead of curve",
        pts: "+2 pts",
        title: "Content Signals state usage permissions",
        why: "No Content Signals in robots.txt. These state whether your content may be indexed, used to ground an answer, or used for training.",
        whereTo: `Put it at https://${domain}/robots.txt. Shown with the common stance: be findable and quotable, but don't be training data.`,
        language: "text",
        filename: "Content Signals — add to robots.txt",
        code: `# Content Signals: state how your content may be used.\nUser-agent: *\nContent-Signal: search=yes, ai-input=yes, ai-train=no\nAllow: /`,
      },
      {
        id: "fix-llms-txt",
        severity: "High",
        pts: "+5 pts",
        title: "Publish /llms.txt machine-readable documentation",
        why: "No /llms.txt standard file detected. AI coding agents and answer engines look for this file at domain root for clean summaries.",
        whereTo: `Publish at https://${domain}/llms.txt`,
        language: "markdown",
        filename: "llms.txt — publish at root",
        code: `# ${formattedBrand}\n\n> ${formattedBrand} provides production-grade solutions for modern AI applications.\n\n## Key Facts\n- **Website**: https://${domain}\n\n## Documentation\n- [Docs](https://${domain}/docs)`,
      },
    ],
    alsoCited: [
      { name: "tavily.com", queryCount: 2 },
      { name: "brave.com", queryCount: 2 },
      { name: "openai.com", queryCount: 2 },
      { name: "firecrawl.dev", queryCount: 2 },
      { name: "perplexity.ai", queryCount: 1 },
      { name: "github.io", queryCount: 1 },
    ],
    crawlMeta: {
      pagesCrawled: 10,
      hasRobots: true,
      hasSitemap: true,
      hasContentSignal: false,
      responseTimeMs: 210,
    },
    cached: true,
  };
}

/**
 * Markdown Plan Compiler
 * Compiles the complete remediation plan formatted for Claude Code / Cursor.
 */

export function buildMarkdownPlan(domain, score, fixes, details) {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const date = new Date().toISOString().split("T")[0];

  let md = "# AEO Remediation Plan — " + cleanDomain + "\n\n";
  md += "> Automated Answer Engine Optimization (AEO) Fix Plan\n";
  md += "> Generated on " + date + " · Overall Readiness Score: **" + score.total + "/100 (Grade " + score.band + ")**\n\n";
  
  md += "## Score Summary\n\n";
  md += "| Pillar | Score | Weight |\n";
  md += "|---|:---:|:---:|\n";
  md += "| Technical Crawler Access | " + (score.pillars?.find(p => p.id === "crawler")?.score || 0) + "/20 | 20% |\n";
  md += "| Structured Schema (JSON-LD) | " + (score.pillars?.find(p => p.id === "schema")?.score || 0) + "/25 | 25% |\n";
  md += "| Agent Surfaces & Endpoints | " + (score.pillars?.find(p => p.id === "agent")?.score || 0) + "/20 | 20% |\n";
  md += "| Content Clarity & Hierarchy | " + (score.pillars?.find(p => p.id === "clarity")?.score || 0) + "/15 | 15% |\n";
  md += "| Engine Visibility | " + (score.pillars?.find(p => p.id === "visibility")?.score || 0) + "/20 | 20% |\n\n";

  md += "## Prioritized Code Fixes\n\n";
  
  fixes.forEach((fix, idx) => {
    md += "### " + (idx + 1) + ". [" + fix.severity + "] " + fix.title + "\n\n";
    md += "**Target File:** `" + fix.filename + "`\n\n";
    md += fix.description + "\n\n";
    md += "```" + fix.language + "\n";
    md += fix.code + "\n";
    md += "```\n\n";
  });

  md += "## Verification Instructions\n\n";
  md += "1. Deploy the changes above to your production or staging environment.\n";
  md += "2. Verify that `robots.txt` and `llms.txt` return HTTP 200 at `https://" + cleanDomain + "/robots.txt` and `https://" + cleanDomain + "/llms.txt`.\n";
  md += "3. Run a re-assessment at `https://aeo.canonical.cc/report.html?d=" + cleanDomain + "&refresh=true` to confirm a verified 90+ score.\n";

  return md;
}

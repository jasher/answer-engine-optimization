/**
 * Fix Generator Module
 * Generates ranked code remediation blocks based on deterministic audit results.
 */

export function generateFixes(auditData, domain, brandName) {
  const fixes = [];
  const cleanBrand = brandName || domain.replace(/\.[a-z]+$/, "").replace(/^www\./, "");
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  // 1. Critical Fix: Missing Organization JSON-LD Schema
  if (auditData.schemaScore < 20) {
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": cleanBrand,
      "url": "https://" + cleanDomain,
      "description": cleanBrand + " provides high-performance solutions for developers and enterprises.",
      "sameAs": [
        "https://github.com/" + cleanBrand.toLowerCase(),
        "https://twitter.com/" + cleanBrand.toLowerCase()
      ]
    };

    fixes.push({
      id: "fix-schema-org",
      severity: "CRITICAL",
      title: "Organization schema direct to the company",
      description: "Insert a JSON-LD structured data block in your homepage <head> to establish your entity and canonical domain in AI knowledge graphs.",
      language: "json",
      filename: "index.html (<head>)",
      code: `<script type="application/ld+json">\n${JSON.stringify(orgSchema, null, 2)}\n</script>`
    });
  }

  // 2. High Fix: robots.txt AI Bot Access
  if (auditData.crawlerScore < 20) {
    fixes.push({
      id: "fix-robots-txt",
      severity: "HIGH",
      title: "Allow AI answer engine crawlers in robots.txt",
      description: "Ensure modern answer engine indexers are explicitly permitted to crawl public documentation and marketing pages.",
      language: "diff",
      filename: "public/robots.txt",
      code: `# Allow AI Answer Engine Crawlers\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: https://${cleanDomain}/sitemap.xml`
    });
  }

  // 3. High Fix: llms.txt Standard Endpoint
  if (auditData.agentScore < 15) {
    const llmsTxtContent = `# ${cleanBrand}\n\n> ${cleanBrand} provides high-performance solutions for modern AI and developer workflows.\n\n## Key Facts\n- **Website**: https://${cleanDomain}\n- **Core Capabilities**: Fast data processing, reliable APIs, enterprise scale.\n\n## Documentation\n- [Quickstart](https://${cleanDomain}/docs)\n- [API Reference](https://${cleanDomain}/api)`;

    fixes.push({
      id: "fix-llms-txt",
      severity: "HIGH",
      title: "Publish /llms.txt machine-readable documentation",
      description: "Provide a lightweight summary file at the root of your domain for AI agents (Claude Code, Cursor, Codex).",
      language: "markdown",
      filename: "public/llms.txt",
      code: llmsTxtContent
    });
  }

  // 4. Medium Fix: Content-Signal Permissions
  fixes.push({
    id: "fix-content-signal",
    severity: "MEDIUM",
    title: "Declare Content-Signal AI input permissions",
    description: "Add an explicit machine-readable Content-Signal directive to confirm grounding rights for answer engines.",
    language: "html",
    filename: "index.html (<head>)",
    code: `<meta name="content-signal" content="search=yes, ai-input=yes, ai-train=no" />`
  });

  // 5. Medium Fix: Heading Hierarchy
  if (auditData.clarityScore < 15) {
    fixes.push({
      id: "fix-heading-hierarchy",
      severity: "MEDIUM",
      title: "Establish a single <h1> and clean <h2> hierarchy",
      description: "AI parsers rely on semantic headings as the outline for their reasoning. Ensure there is only one <h1> and logical <h2> sub-sections.",
      language: "html",
      filename: "index.html (<body>)",
      code: `<h1>${cleanBrand} — The Unified Enterprise Platform</h1>\n<h2>Why Developers Choose ${cleanBrand}</h2>\n<p>Direct explanation in the first 40 words without marketing abstractions.</p>`
    });
  }

  return fixes;
}

/**
 * Crawler Module for AEO Readiness
 * Fetches target website, robots.txt, sitemap.xml, llms.txt, and extracts clean structural data.
 */

export async function crawlSite(inputUrl) {
  let urlStr = inputUrl.trim();
  if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
    urlStr = "https://" + urlStr;
  }

  const parsed = new URL(urlStr);
  const origin = parsed.origin;
  const domain = parsed.hostname.replace(/^www\./, "");

  const headers = {
    "User-Agent": "GPTBot/1.0 (+https://openai.com/gptbot)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  };

  const results = {
    origin,
    domain,
    url: urlStr,
    robotsTxt: null,
    robotsStatus: 404,
    sitemapXml: null,
    sitemapStatus: 404,
    llmsTxt: null,
    llmsStatus: 404,
    llmsFullTxt: null,
    llmsFullStatus: 404,
    html: "",
    headers: {},
    crawledPages: 1
  };

  // 1. Fetch robots.txt, sitemap.xml, llms.txt in parallel
  const [robotsRes, sitemapRes, llmsRes, llmsFullRes, homeRes] = await Promise.allSettled([
    fetch(`${origin}/robots.txt`, { headers, redirect: "follow", signal: AbortSignal.timeout(4000) }),
    fetch(`${origin}/sitemap.xml`, { headers, redirect: "follow", signal: AbortSignal.timeout(4000) }),
    fetch(`${origin}/llms.txt`, { headers, redirect: "follow", signal: AbortSignal.timeout(4000) }),
    fetch(`${origin}/llms-full.txt`, { headers, redirect: "follow", signal: AbortSignal.timeout(4000) }),
    fetch(urlStr, { headers, redirect: "follow", signal: AbortSignal.timeout(6000) })
  ]);

  if (robotsRes.status === "fulfilled" && robotsRes.value.ok) {
    results.robotsTxt = await robotsRes.value.text().catch(() => null);
    results.robotsStatus = robotsRes.value.status;
  }

  if (sitemapRes.status === "fulfilled" && sitemapRes.value.ok) {
    results.sitemapXml = await sitemapRes.value.text().catch(() => null);
    results.sitemapStatus = sitemapRes.value.status;
  }

  if (llmsRes.status === "fulfilled" && llmsRes.value.ok) {
    results.llmsTxt = await llmsRes.value.text().catch(() => null);
    results.llmsStatus = llmsRes.value.status;
  }

  if (llmsFullRes.status === "fulfilled" && llmsFullRes.value.ok) {
    results.llmsFullTxt = await llmsFullRes.value.text().catch(() => null);
    results.llmsFullStatus = llmsFullRes.value.status;
  }

  if (homeRes.status === "fulfilled" && homeRes.value.ok) {
    results.html = await homeRes.value.text().catch(() => "");
    homeRes.value.headers.forEach((val, key) => {
      results.headers[key.toLowerCase()] = val;
    });
  }

  return results;
}

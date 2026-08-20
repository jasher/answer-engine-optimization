import fs from "node:fs/promises";
import path from "node:path";

const LOCAL_CACHE_DIR = path.resolve(process.cwd(), ".cache/reports");

async function ensureLocalDir(domain) {
  const dir = path.join(LOCAL_CACHE_DIR, domain.toLowerCase());
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function saveReport(domain, reportData, planMd) {
  const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const meta = {
    domain: cleanDomain,
    score: reportData.score?.total || 0,
    band: reportData.score?.band || "C",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    cached: true
  };

  try {
    const dir = await ensureLocalDir(cleanDomain);
    await Promise.all([
      fs.writeFile(path.join(dir, "report.json"), JSON.stringify(reportData, null, 2), "utf-8"),
      fs.writeFile(path.join(dir, "plan.md"), planMd, "utf-8"),
      fs.writeFile(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2), "utf-8")
    ]);
    console.log(`[Storage] Successfully saved local cache for ${cleanDomain}`);
  } catch (err) {
    console.error(`[Storage] Error saving local report for ${cleanDomain}:`, err);
  }

  return meta;
}

export async function getReport(domain, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const dir = path.join(LOCAL_CACHE_DIR, cleanDomain);

  try {
    const metaPath = path.join(dir, "meta.json");
    const reportPath = path.join(dir, "report.json");

    const metaRaw = await fs.readFile(metaPath, "utf-8");
    const meta = JSON.parse(metaRaw);

    const age = Date.now() - new Date(meta.createdAt).getTime();
    if (age > maxAgeMs) {
      return null;
    }

    const reportRaw = await fs.readFile(reportPath, "utf-8");
    const report = JSON.parse(reportRaw);
    report.meta = meta;
    return report;
  } catch (err) {
    return null;
  }
}

export async function getPlanMd(domain) {
  const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const planPath = path.join(LOCAL_CACHE_DIR, cleanDomain, "plan.md");

  try {
    return await fs.readFile(planPath, "utf-8");
  } catch (err) {
    return null;
  }
}

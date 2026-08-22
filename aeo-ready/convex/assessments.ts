import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Query: Get Cached Assessment by Domain ────────────────────────────────
export const getByDomain = query({
  args: { domain: v.string() },
  handler: async (ctx, args) => {
    const cleanDomain = args.domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const assessment = await ctx.db
      .query("assessments")
      .withIndex("by_domain", (q) => q.eq("domain", cleanDomain))
      .order("desc")
      .first();

    if (!assessment) return null;

    // Check 7-day expiration
    const isExpired = new Date(assessment.expiresAt).getTime() < Date.now();
    return {
      ...assessment,
      isExpired,
      cached: true,
    };
  },
});

// ── Query: Get Storage URL for plan.md ────────────────────────────────────
export const getPlanUrl = query({
  args: { storageId: v.optional(v.id("_storage")) },
  handler: async (ctx, args) => {
    if (!args.storageId) return null;
    return await ctx.storage.getUrl(args.storageId);
  },
});

// ── Mutation: Save Completed Assessment ──────────────────────────────────
export const saveAssessment = mutation({
  args: {
    domain: v.string(),
    score: v.object({
      total: v.number(),
      band: v.string(),
    }),
    pillars: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        score: v.number(),
        max: v.number(),
      })
    ),
    engineResults: v.array(
      v.object({
        engine: v.string(),
        name: v.string(),
        badge: v.string(),
        accentColor: v.string(),
        mentionRate: v.number(),
        citationRate: v.number(),
        mentionCount: v.optional(v.string()),
        citationCount: v.optional(v.string()),
        band: v.string(),
        queryResults: v.optional(v.array(v.any())),
        notMeasured: v.optional(v.boolean()),
      })
    ),
    queries: v.array(
      v.object({
        text: v.string(),
        status: v.union(v.literal("win"), v.literal("partial"), v.literal("lose")),
        ratio: v.string(),
      })
    ),
    fixes: v.array(
      v.object({
        id: v.string(),
        severity: v.string(),
        pts: v.string(),
        title: v.string(),
        why: v.string(),
        whereTo: v.optional(v.string()),
        whereToWarn: v.optional(v.string()),
        language: v.string(),
        filename: v.string(),
        code: v.string(),
        pending: v.optional(v.string()),
      })
    ),
    alsoCited: v.array(
      v.object({
        name: v.string(),
        queryCount: v.number(),
      })
    ),
    crawlMeta: v.object({
      pagesCrawled: v.number(),
      hasRobots: v.boolean(),
      hasSitemap: v.boolean(),
      hasContentSignal: v.boolean(),
      responseTimeMs: v.number(),
    }),
    planStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const cleanDomain = args.domain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const id = await ctx.db.insert("assessments", {
      ...args,
      domain: cleanDomain,
      crawledAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    return id;
  },
});

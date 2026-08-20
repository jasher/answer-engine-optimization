import { query, mutation, action } from "./_generated/server";
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

// ── Mutation: Save Completed Assessment ──────────────────────────────────
export const save = mutation({
  args: {
    domain: v.string(),
    score: v.number(),
    band: v.string(),
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
        mentionRate: v.number(),
        citationRate: v.number(),
        band: v.string(),
        queryResults: v.optional(v.array(v.any())),
      })
    ),
    queries: v.array(v.string()),
    fixes: v.array(
      v.object({
        id: v.string(),
        severity: v.string(),
        title: v.string(),
        description: v.string(),
        language: v.string(),
        filename: v.string(),
        code: v.string(),
      })
    ),
    alsoCited: v.array(
      v.object({
        name: v.string(),
        queryCount: v.number(),
      })
    ),
    isPaid: v.boolean(),
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

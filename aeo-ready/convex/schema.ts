import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  assessments: defineTable({
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
    crawledAt: v.string(),
    expiresAt: v.string(),
  })
    .index("by_domain", ["domain"])
    .index("by_crawledAt", ["crawledAt"]),
});

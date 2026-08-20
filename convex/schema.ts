import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  assessments: defineTable({
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
    planStorageId: v.optional(v.id("_storage")),
    isPaid: v.boolean(),
    crawledAt: v.string(),
    expiresAt: v.string(),
  })
    .index("by_domain", ["domain"])
    .index("by_crawledAt", ["crawledAt"]),

  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    credits: v.number(),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_email", ["email"]),
});

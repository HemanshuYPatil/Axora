import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    name: v.string(),
    price: v.number(),
    formattedPrice: v.string(),
    originalPrice: v.string(),
    rating: v.number(),
    reviews: v.number(),
    imageId: v.id("_storage"),
    category: v.string(),
    badge: v.optional(v.string()),
  }),
  reviews: defineTable({
    productId: v.string(),
    userName: v.string(),
    rating: v.number(),
    comment: v.string(),
  }).index("by_product_id", ["productId"]),
  users: defineTable({
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    fullName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    locationLabel: v.optional(v.string()),
    locationLatitude: v.optional(v.number()),
    locationLongitude: v.optional(v.number()),
    locationUpdatedAt: v.optional(v.number()),
    syncedAt: v.number(),
  }).index("by_clerk_user_id", ["clerkUserId"]),
});

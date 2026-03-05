import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    fullName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        ...args,
        syncedAt: now,
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      syncedAt: now,
    });
  },
});

export const saveLocation = mutation({
  args: {
    clerkUserId: v.string(),
    locationLabel: v.string(),
    locationLatitude: v.optional(v.number()),
    locationLongitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        locationLabel: args.locationLabel,
        locationLatitude: args.locationLatitude,
        locationLongitude: args.locationLongitude,
        locationUpdatedAt: now,
        syncedAt: now,
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      locationLabel: args.locationLabel,
      locationLatitude: args.locationLatitude,
      locationLongitude: args.locationLongitude,
      locationUpdatedAt: now,
      syncedAt: now,
    });
  },
});

export const getUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", args.clerkUserId)
      )
      .first();
  },
});

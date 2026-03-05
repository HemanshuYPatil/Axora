import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getReviews = query({
  args: { productId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_product_id", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();
  },
});

export const addReview = mutation({
  args: {
    productId: v.string(),
    userName: v.string(),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    // Insert the new review
    await ctx.db.insert("reviews", {
      productId: args.productId,
      userName: args.userName,
      rating: args.rating,
      comment: args.comment,
    });

    // Try to update the product rating if it's a valid Convex product
    try {
      // Very basic check if it looks like a Convex ID (they are typically alphanumeric strings of length > 20)
      if (args.productId.length > 20) {
        const product = await ctx.db.get(args.productId as Id<"products">);
        
        if (product) {
          const allReviews = await ctx.db
            .query("reviews")
            .withIndex("by_product_id", (q) => q.eq("productId", args.productId))
            .collect();
            
          const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
          const avgRating = totalRating / allReviews.length;
          
          await ctx.db.patch(product._id, {
            rating: Number(avgRating.toFixed(1)),
            reviews: allReviews.length,
          });
        }
      }
    } catch (e) {
      // It's likely a dummy product (e.g., "t1", "n1"), so we ignore the patch error
      console.log("Could not patch product. Likely a dummy product:", e);
    }
  },
});

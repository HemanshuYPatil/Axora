import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    formattedPrice: v.string(),
    originalPrice: v.string(),
    imageId: v.id("_storage"),
    category: v.string(),
    badge: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      ...args,
      rating: 0,
      reviews: 0,
    });
  },
});

export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return Promise.all(
      products.map(async (product) => ({
        ...product,
        // _id is included automatically
        image: await ctx.storage.getUrl(product.imageId),
      }))
    );
  },
});

export const getProductById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;
    return {
      ...product,
      image: await ctx.storage.getUrl(product.imageId),
    };
  },
});

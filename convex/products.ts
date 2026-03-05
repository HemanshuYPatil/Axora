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
    sellerClerkUserId: v.string(),
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

export const getSellerProducts = query({
  args: {
    sellerClerkUserId: v.string(),
    refreshKey: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();
    const sellerProducts = products
      .filter((product) => product.sellerClerkUserId === args.sellerClerkUserId)
      .sort((a, b) => b._creationTime - a._creationTime);

    return Promise.all(
      sellerProducts.map(async (product) => ({
        ...product,
        image: await ctx.storage.getUrl(product.imageId),
      }))
    );
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    sellerClerkUserId: v.string(),
    name: v.string(),
    price: v.number(),
    formattedPrice: v.string(),
    originalPrice: v.string(),
    category: v.string(),
    badge: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Product not found");
    }

    if (existing.sellerClerkUserId !== args.sellerClerkUserId) {
      throw new Error("You are not allowed to edit this product");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      price: args.price,
      formattedPrice: args.formattedPrice,
      originalPrice: args.originalPrice,
      category: args.category,
      badge: args.badge,
      imageId: args.imageId ?? existing.imageId,
    });

    if (args.imageId && args.imageId !== existing.imageId) {
      await ctx.storage.delete(existing.imageId);
    }

    return args.id;
  },
});

export const deleteProduct = mutation({
  args: {
    id: v.id("products"),
    sellerClerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      return null;
    }

    if (existing.sellerClerkUserId !== args.sellerClerkUserId) {
      throw new Error("You are not allowed to delete this product");
    }

    await ctx.storage.delete(existing.imageId);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

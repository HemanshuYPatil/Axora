"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

import { AddToCartButton } from "@/app/components/add-to-cart-button";
import { formatInrPrice, getProductById } from "@/app/lib/products";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const product = getProductById(params.id);

  if (!product) {
    return (
      <main className="min-h-screen bg-[var(--color-surface)] px-4 md:px-8 py-16">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Product not found
          </h1>
          <p className="text-gray-600 mb-6">
            The product you requested is unavailable.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-full bg-[var(--color-brand)] text-white px-5 py-2.5 font-semibold hover:bg-[var(--color-brand-hover)] transition-colors"
          >
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 md:px-8 py-10 md:py-14">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)] hover:underline mb-6"
        >
          <span aria-hidden>&larr;</span>
          Continue shopping
        </Link>

        <article className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-2xl border border-gray-200 p-5 md:p-8 shadow-sm">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-8"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-sm text-gray-500 mb-2">{product.category}</p>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-gray-700 leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="flex items-center gap-3 mb-4">
              <span className="bg-green-700 text-white text-xs font-semibold rounded px-2 py-1">
                {product.rating} / 5
              </span>
              <span className="text-sm text-gray-600">
                {product.reviews} reviews
              </span>
            </div>

            <div className="flex items-end gap-3 mb-8">
              <span className="text-3xl font-bold text-gray-900">
                {formatInrPrice(product.priceInr)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatInrPrice(product.originalPriceInr)}
              </span>
            </div>

            <AddToCartButton
              productName={product.name}
              className="w-full md:w-auto px-8 py-3 rounded-lg bg-[var(--color-brand)] text-white font-semibold hover:bg-[var(--color-brand-hover)] transition-colors"
            />
            <p className="text-xs text-gray-500 mt-3">
              Anyone can view product details. Sign-in is required only when
              adding to cart.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type ProductForm = {
  name: string;
  price: string;
  originalPrice: string;
  category: string;
  badge: string;
};

const CATEGORY_OPTIONS = [
  "Electronics",
  "Mobiles",
  "Fashion",
  "Appliances",
  "Home & Kitchen",
  "Furniture",
  "Books",
];

const EMPTY_FORM: ProductForm = {
  name: "",
  price: "",
  originalPrice: "",
  category: "Electronics",
  badge: "",
};

const toInr = (amount: number) => `?${amount.toLocaleString("en-IN")}`;

const parseMoneyString = (value: string) => value.replace(/[^\d]/g, "");

export default function SellerDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);

  const sellerProducts =
    useQuery(
      api.products.getSellerProducts,
      isLoaded && isSignedIn && user
        ? { sellerClerkUserId: user.id }
        : "skip"
    ) ?? [];

  const [formData, setFormData] = useState<ProductForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingProductId, setEditingProductId] = useState<Id<"products"> | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<
    Id<"products"> | null
  >(null);

  const isEditing = editingProductId !== null;

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setEditingProductId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const uploadImageToConvex = async (file: File): Promise<Id<"_storage">> => {
    const postUrl = await generateUploadUrl();
    const uploadResponse = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Image upload failed");
    }

    const payload = (await uploadResponse.json()) as { storageId: Id<"_storage"> };
    return payload.storageId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded || !isSignedIn || !user) {
      alert("Please sign in to manage products");
      return;
    }

    if (!isEditing && !imageFile) {
      alert("Please select an image");
      return;
    }

    const parsedPrice = Number(formData.price);
    const parsedOriginalPrice = formData.originalPrice
      ? Number(formData.originalPrice)
      : 0;

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      alert("Please enter a valid selling price");
      return;
    }

    if (formData.originalPrice && (!Number.isFinite(parsedOriginalPrice) || parsedOriginalPrice < 0)) {
      alert("Please enter a valid original price");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedImageId = imageFile
        ? await uploadImageToConvex(imageFile)
        : undefined;

      const payload = {
        sellerClerkUserId: user.id,
        name: formData.name.trim(),
        price: parsedPrice,
        formattedPrice: toInr(parsedPrice),
        originalPrice: parsedOriginalPrice > 0 ? toInr(parsedOriginalPrice) : "",
        category: formData.category,
        badge: formData.badge.trim() || undefined,
      };

      if (isEditing && editingProductId) {
        await updateProduct({
          id: editingProductId,
          ...payload,
          imageId: uploadedImageId,
        });
        alert("Product updated successfully");
      } else {
        if (!uploadedImageId) {
          throw new Error("Image is required");
        }

        await createProduct({
          ...payload,
          imageId: uploadedImageId,
        });
        alert("Product uploaded successfully");
      }

      resetForm();
    } catch (error) {
      console.error(error);
      alert(isEditing ? "Failed to update product" : "Failed to upload product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (product: (typeof sellerProducts)[number]) => {
    const originalPriceDigits = parseMoneyString(product.originalPrice ?? "");

    setEditingProductId(product._id);
    setFormData({
      name: product.name,
      price: String(product.price),
      originalPrice: originalPriceDigits ? String(Number(originalPriceDigits)) : "",
      category: product.category,
      badge: product.badge ?? "",
    });
    setImageFile(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId: Id<"products">) => {
    if (!isSignedIn || !user) {
      alert("Please sign in to delete products");
      return;
    }

    const confirmed = window.confirm("Delete this product? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    setDeletingProductId(productId);

    try {
      await deleteProduct({
        id: productId,
        sellerClerkUserId: user.id,
      });

      if (editingProductId === productId) {
        resetForm();
      }

      alert("Product deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-12 font-sans">
      <nav className="bg-white border-b border-gray-200 px-4 py-4 md:px-8 flex items-center justify-between shadow-sm sticky top-0 z-50 mb-8">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[var(--color-brand)] flex items-center gap-2"
          >
            AXORA
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded ml-2">
              Seller
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/seller/dashboard"
            className="text-[var(--color-brand)] bg-blue-50 transition-colors px-3 py-2 rounded-lg"
          >
            Manage Products
          </Link>
          <Link
            href="/seller/analytics"
            className="text-gray-600 hover:text-[var(--color-brand)] px-3 py-2 rounded-lg transition-colors"
          >
            Analytics
          </Link>
        </div>
      </nav>

      {!isLoaded ? (
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-500">
            Loading seller dashboard...
          </div>
        </div>
      ) : !isSignedIn ? (
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sign in to manage your products
            </h1>
            <p className="text-gray-600 mb-6">
              Upload, edit, and delete products from your seller account.
            </p>
            <SignInButton mode="modal">
              <button className="inline-flex rounded-lg bg-[var(--color-brand)] px-5 py-2.5 text-white font-semibold hover:bg-[var(--color-brand-hover)] transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 xl:grid-cols-[1.1fr_1.4fr] gap-8 items-start">
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6 gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Edit Product" : "Upload New Product"}
              </h1>
              {isEditing ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-medium text-gray-600 hover:text-[var(--color-brand)]"
                >
                  Cancel Editing
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]"
                    placeholder="E.g., Wireless Earbuds"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]"
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (INR)
                  </label>
                  <input
                    required
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    type="number"
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]"
                    placeholder="1499"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (INR)
                  </label>
                  <input
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]"
                    placeholder="2999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge (Optional)
                </label>
                <input
                  name="badge"
                  value={formData.badge}
                  onChange={handleChange}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]"
                  placeholder="E.g., Bestseller, 50% Off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image {isEditing ? "(optional - only if changing image)" : ""}
                </label>
                <input
                  required={!isEditing}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-[var(--color-brand)] text-white font-bold py-3 rounded-xl hover:bg-[var(--color-brand-hover)] transition-colors disabled:bg-gray-400"
              >
                {isSubmitting
                  ? isEditing
                    ? "Updating Product..."
                    : "Uploading Product..."
                  : isEditing
                    ? "Update Product"
                    : "Upload Product"}
              </button>
            </form>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Uploaded Products</h2>

            {sellerProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                You have not uploaded any products yet.
              </div>
            ) : (
              <div className="space-y-4">
                {sellerProducts.map((product) => (
                  <article
                    key={product._id}
                    className="border border-gray-200 rounded-xl p-4 flex items-start gap-4"
                  >
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      <Image
                        src={
                          product.image ||
                          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"
                        }
                        alt={product.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                      <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-700 mt-1">{product.formattedPrice}</p>
                      {product.badge ? (
                        <span className="inline-block mt-2 text-xs font-semibold bg-blue-50 text-[var(--color-brand)] px-2 py-1 rounded">
                          {product.badge}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditClick(product)}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(product._id)}
                        disabled={deletingProductId === product._id}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                      >
                        {deletingProductId === product._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

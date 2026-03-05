"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SellerDashboard() {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const createProduct = useMutation(api.products.createProduct);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "Electronics",
    badge: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please select an image");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Get an upload URL
      const postUrl = await generateUploadUrl();

      // 2. Upload the file to Convex storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": imageFile.type },
        body: imageFile,
      });
      const { storageId } = await result.json();

      // 3. Create the product document in Convex
      await createProduct({
        name: formData.name,
        price: Number(formData.price),
        formattedPrice: `₹${Number(formData.price).toLocaleString("en-IN")}`,
        originalPrice: formData.originalPrice ? `₹${Number(formData.originalPrice).toLocaleString("en-IN")}` : "",
        category: formData.category,
        badge: formData.badge || undefined,
        imageId: storageId,
      });

      alert("Product uploaded successfully!");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Failed to upload product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-12 font-sans">
      {/* Seller Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4 md:px-8 flex items-center justify-between shadow-sm sticky top-0 z-50 mb-12">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[var(--color-brand)] flex items-center gap-2">
            AXORA <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded ml-2">Seller</span>
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/seller/dashboard" className="text-[var(--color-brand)] bg-blue-50 transition-colors px-3 py-2 rounded-lg">
            Upload Products
          </Link>
          <Link href="/seller/analytics" className="text-gray-600 hover:text-[var(--color-brand)] px-3 py-2 rounded-lg transition-colors">
            Analytics
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload New Product</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]" placeholder="E.g., Wireless Earbuds" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]">
                <option value="Electronics">Electronics</option>
                <option value="Mobiles">Mobiles</option>
                <option value="Fashion">Fashion</option>
                <option value="Appliances">Appliances</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Furniture">Furniture</option>
                <option value="Books">Books</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹)</label>
              <input required name="price" value={formData.price} onChange={handleChange} type="number" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]" placeholder="1499" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
              <input name="originalPrice" value={formData.originalPrice} onChange={handleChange} type="number" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]" placeholder="2999" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Badge (Optional)</label>
            <input name="badge" value={formData.badge} onChange={handleChange} type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]" placeholder="E.g., Bestseller, 50% Off" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <input 
              required
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
            {isSubmitting ? "Uploading Product..." : "Upload Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

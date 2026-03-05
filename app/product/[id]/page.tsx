"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

// Dummy data fallback
const DUMMY_PRODUCTS = [
  { id: "t1", name: "Noise Cancelling Headphones V2", price: 14999, formattedPrice: "₹14,999", originalPrice: "₹19,999", rating: 4.8, reviews: 1240, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop", category: "Electronics", badge: "Bestseller" },
  { id: "t2", name: "Ultra HD Smart TV 55\"", price: 42500, formattedPrice: "₹42,500", originalPrice: "₹65,000", rating: 4.6, reviews: 890, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop", category: "Appliances", badge: "50% Off" },
  { id: "t3", name: "Minimalist Casual Sneakers", price: 2499, formattedPrice: "₹2,499", originalPrice: "₹4,999", rating: 4.5, reviews: 3200, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop", category: "Fashion" },
  { id: "t4", name: "Pro Gaming Laptop 16GB RAM", price: 89990, formattedPrice: "₹89,990", originalPrice: "₹1,15,000", rating: 4.9, reviews: 450, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop", category: "Electronics", badge: "New" },
  { id: "t5", name: "Ceramic Coffee Mug Set", price: 799, formattedPrice: "₹799", originalPrice: "₹1,200", rating: 4.3, reviews: 156, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop", category: "Home & Kitchen" },
  { id: "n1", name: "Smart Watch Series 8", price: 28900, formattedPrice: "₹28,900", originalPrice: "₹32,000", rating: 4.7, reviews: 98, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop", category: "Electronics" },
  { id: "n2", name: "Organic Cotton T-Shirt", price: 899, formattedPrice: "₹899", originalPrice: "₹1,499", rating: 4.4, reviews: 45, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop", category: "Fashion" },
  { id: "n3", name: "Professional Camera Lens", price: 55000, formattedPrice: "₹55,000", originalPrice: "₹60,000", rating: 4.9, reviews: 21, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop", category: "Electronics" },
  { id: "n4", name: "Ergonomic Office Chair", price: 8500, formattedPrice: "₹8,500", originalPrice: "₹12,000", rating: 4.6, reviews: 310, image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800&auto=format&fit=crop", category: "Furniture" },
  { id: "m1", name: "Flagship Smartphone 5G", price: 74999, formattedPrice: "₹74,999", originalPrice: "₹89,999", rating: 4.8, reviews: 4512, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop", category: "Mobiles", badge: "Sale" },
  { id: "m2", name: "Budget Smartphone 4G", price: 12999, formattedPrice: "₹12,999", originalPrice: "₹15,999", rating: 4.2, reviews: 1024, image: "https://images.unsplash.com/photo-1598327105666-5b89351cb31b?q=80&w=800&auto=format&fit=crop", category: "Mobiles" },
  { id: "b1", name: "The Pragmatic Programmer", price: 450, formattedPrice: "₹450", originalPrice: "₹600", rating: 4.9, reviews: 850, image: "https://images.unsplash.com/photo-1589998059171-989d887dda6e?q=80&w=800&auto=format&fit=crop", category: "Books" },
  { id: "a1", name: "Automatic Washing Machine", price: 22500, formattedPrice: "₹22,500", originalPrice: "₹30,000", rating: 4.5, reviews: 312, image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=800&auto=format&fit=crop", category: "Appliances" }
];

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const productIdStr = Array.isArray(id) ? id[0] : id;
  const hasProductId = typeof productIdStr === "string" && productIdStr.length > 0;
  
  // Real-time reviews from Convex
  const reviews = useQuery(
    api.reviews.getReviews,
    hasProductId ? { productId: productIdStr } : "skip"
  ) || [];
  const addReview = useMutation(api.reviews.addReview);

  // Review Form State
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", userName: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Try to find in dummy data first
  const dummyProduct = hasProductId
    ? DUMMY_PRODUCTS.find((p) => p.id === productIdStr)
    : undefined;

  // If not dummy, try fetching from Convex assuming id is a valid Convex ID
  const isConvexId = hasProductId && productIdStr.length > 10;
  
  const convexProduct = useQuery(
    api.products.getProductById, 
    isConvexId ? { id: productIdStr as Id<"products"> } : "skip"
  );

  const baseProduct = dummyProduct || (convexProduct ? {
    id: convexProduct._id,
    name: convexProduct.name,
    price: convexProduct.price,
    formattedPrice: convexProduct.formattedPrice,
    originalPrice: convexProduct.originalPrice,
    rating: convexProduct.rating,
    reviews: convexProduct.reviews,
    image: convexProduct.image || "",
    category: convexProduct.category,
    badge: convexProduct.badge,
  } : null);

  if (!baseProduct && (isConvexId && convexProduct === undefined)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!baseProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">Return to Home</button>
      </div>
    );
  }

  // Calculate dynamic rating and total review counts based on Convex real-time reviews + base stats
  let displayRating = baseProduct.rating || 0;
  let displayReviewCount = baseProduct.reviews || 0;

  if (reviews.length > 0) {
    // If there are real-time reviews, compute the true average
    // To make it blend nicely with dummy data, we consider dummy data as the "base" set of reviews
    const totalBaseScore = (baseProduct.rating || 0) * (baseProduct.reviews || 0);
    const newTotalScore = reviews.reduce((sum, r) => sum + r.rating, 0);
    const totalScore = totalBaseScore + newTotalScore;
    const totalReviews = (baseProduct.reviews || 0) + reviews.length;
    
    displayRating = Number((totalScore / totalReviews).toFixed(1));
    displayReviewCount = totalReviews;
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.comment) {
      alert("Please fill in all fields");
      return;
    }
    if (!hasProductId) {
      alert("Invalid product.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addReview({
        productId: productIdStr,
        userName: newReview.userName,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      setNewReview({ rating: 5, comment: "", userName: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-20 font-sans">
      {/* Universal Navigation */}
      <nav className="sticky top-0 z-50 glass-nav px-4 py-4 md:px-8 flex items-center justify-between gap-4 shadow-sm bg-white border-b border-gray-100">
        <Link href="/" className="text-2xl font-bold tracking-tight text-[var(--color-brand)] flex items-center gap-2">
          AXORA
        </Link>
      </nav>

      <div className="max-w-[1200px] mx-auto mt-12 px-4 md:px-8">
        <button onClick={() => router.back()} className="text-gray-500 mb-6 hover:text-[var(--color-brand)] flex items-center gap-2 text-sm font-medium transition-colors">
          &larr; Back to shopping
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row mb-12">
          
          {/* Image Section */}
          <div className="w-full md:w-1/2 p-8 md:p-12 bg-gray-50 flex items-center justify-center relative min-h-[400px]">
            {baseProduct.badge && (
              <span className="absolute top-6 left-6 z-10 bg-[var(--color-accent)] text-white text-xs font-bold px-3 py-1 rounded shadow-sm uppercase tracking-wide">
                {baseProduct.badge}
              </span>
            )}
            <div className="relative w-full aspect-square">
              <Image src={baseProduct.image} alt={baseProduct.name} fill className="object-contain drop-shadow-md" />
            </div>
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <p className="text-sm text-[var(--color-brand)] font-bold uppercase tracking-wider mb-2">{baseProduct.category}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{baseProduct.name}</h1>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center bg-green-700 text-white px-2 py-1 rounded text-sm font-bold shadow-sm">
                  {displayRating} <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              </div>
              <span className="text-sm text-[var(--color-brand)] font-medium hover:underline cursor-pointer">
                <a href="#reviews">({displayReviewCount} reviews)</a>
              </span>
            </div>

            <div className="flex items-end gap-3 mb-8">
              <span className="text-4xl font-black text-gray-900">{baseProduct.formattedPrice}</span>
              {baseProduct.originalPrice && <span className="text-lg text-gray-400 line-through mb-1">{baseProduct.originalPrice}</span>}
            </div>

            <div className="space-y-4 mb-8 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                In stock, ready to ship
              </p>
              <p className="flex items-center gap-2">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Fast delivery available
              </p>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-[var(--color-brand)] text-white font-bold py-4 rounded-xl hover:bg-[var(--color-brand-hover)] transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                Add to Cart
              </button>
              <button className="w-14 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div id="reviews" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Customer Reviews</h2>
          
          <div className="flex flex-col md:flex-row gap-12">
            {/* Reviews List */}
            <div className="flex-1 space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
                  <p>No new reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[var(--color-brand)] font-bold text-lg">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{review.userName}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-3 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <div className="w-full md:w-[400px] flex-shrink-0 bg-gray-50 p-6 rounded-2xl h-fit border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <svg className={`w-8 h-8 ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    required
                    type="text"
                    value={newReview.userName}
                    onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] bg-white"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    required
                    rows={4}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] bg-white resize-none"
                    placeholder="What did you like or dislike about this product?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[var(--color-brand)] text-white font-bold py-3 rounded-xl hover:bg-[var(--color-brand-hover)] transition-colors disabled:bg-gray-400 mt-4 shadow-sm"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

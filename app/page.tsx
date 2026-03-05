"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// --- Data ---
const CATEGORIES = [
  "All", "Electronics", "Mobiles", "Fashion", "Appliances", "Home & Kitchen", "Furniture", "Books"
];

type Product = {
  id: string;
  name: string;
  price: number; 
  formattedPrice: string;
  originalPrice: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  badge?: string;
};

const DUMMY_PRODUCTS: Product[] = [
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

type CartItem = {
  product: Product;
  quantity: number;
};

export default function Home() {
  const { isLoaded: clerkLoaded, isSignedIn } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroGridRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Fetch from convex
  const convexProductsRaw = useQuery(api.products.getProducts) || [];
  
  const convexProducts: Product[] = convexProductsRaw.map((p) => ({
    id: p._id,
    name: p.name,
    price: p.price,
    formattedPrice: p.formattedPrice,
    originalPrice: p.originalPrice || "",
    rating: p.rating || 0,
    reviews: p.reviews || 0,
    image: p.image || "",
    category: p.category,
    badge: p.badge,
  }));

  const ALL_PRODUCTS = useMemo(() => {
    return [...convexProducts, ...DUMMY_PRODUCTS];
  }, [convexProducts]);

  // --- State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryLocationText, setDeliveryLocationText] = useState(() => {
    if (typeof navigator !== "undefined" && !navigator.geolocation) {
      return "Detecting location...";
    }

    return "Detecting location...";
  });

  // Use this state to track if user has submitted a search to force animation
  const [triggerRender, setTriggerRender] = useState(0);

  // --- Derived Data (Search & Filter) ---
  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, ALL_PRODUCTS]);

  const cartTotal = useMemo(() => cart.reduce((total, item) => total + (item.product.price * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);

  const isBrowsing = searchQuery !== "" || activeCategory !== "All";
  const RAZORPAY_PAYMENT_PAGE_URL = "https://rzp.io/rzp/Rer8CUR";

  const resolveLocationLabel = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        const query = new URLSearchParams({
          format: "jsonv2",
          lat: latitude.toString(),
          lon: longitude.toString(),
          zoom: "10",
          addressdetails: "1",
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?${query.toString()}`
        );

        if (!response.ok) {
          return "";
        }

        const data = await response.json();
        const address = data?.address ?? {};

        const area =
          address.suburb ??
          address.neighbourhood ??
          address.city_district ??
          address.quarter ??
          address.residential ??
          address.city ??
          address.town ??
          address.village ??
          address.county ??
          address.hamlet;

        return area ?? "";
      } catch {
        return "";
      }
    },
    []
  );

  const resolveApproxLocationFromIp = useCallback(async () => {
    try {
      const response = await fetch("https://ipwho.is/", { cache: "no-store" });
      if (!response.ok) {
        return "";
      }

      const data = (await response.json()) as {
        success?: boolean;
        city?: string;
        region?: string;
        country?: string;
      };

      if (!data.success) {
        return "";
      }

      return data.city ?? data.region ?? data.country ?? "";
    } catch {
      return "";
    }
  }, []);

  const detectLocation = useCallback(async () => {
    setDeliveryLocationText("Detecting location...");

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const ipLabel = await resolveApproxLocationFromIp();
      setDeliveryLocationText(ipLabel || "Location unavailable");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 300000,
        })
      );

      const latitude = Number(position.coords.latitude.toFixed(4));
      const longitude = Number(position.coords.longitude.toFixed(4));
      const label = await resolveLocationLabel(latitude, longitude);
      setDeliveryLocationText(label || `Lat ${latitude}, Lng ${longitude}`);
    } catch {
      const ipLabel = await resolveApproxLocationFromIp();
      if (ipLabel) {
        setDeliveryLocationText(ipLabel);
      } else {
        setDeliveryLocationText("Location unavailable");
      }
    }
  }, [resolveApproxLocationFromIp, resolveLocationLabel]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void detectLocation();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [detectLocation]);

  // --- Handlers ---
  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setSearchQuery(""); // Clear text search when clicking a category tag
    setTriggerRender(prev => prev + 1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setActiveCategory("All"); // Reset category if typing a global search
    setTriggerRender(prev => prev + 1);
  };

  const addToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handlePayNow = () => {
    window.location.assign(RAZORPAY_PAYMENT_PAGE_URL);
  };

  // --- Animations ---
  useEffect(() => {
    if (!isBrowsing && heroGridRef.current) {
      gsap.fromTo(heroGridRef.current.children, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
    
    if (isBrowsing && searchResultsRef.current) {
      gsap.fromTo(searchResultsRef.current.querySelectorAll(".product-card"), 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [isBrowsing, triggerRender, ALL_PRODUCTS]);

  // Render Product Card Component
  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/product/${product.id}`} className="product-card group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer">
      <div className="relative aspect-square w-full p-4 bg-white product-card-img-container">
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 bg-[var(--color-accent)] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
            {product.badge}
          </span>
        )}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
        <div className="relative w-full h-full">
          <Image src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"} alt={product.name} fill className="object-contain" sizes="(max-width: 768px) 50vw, 20vw" />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 border-t border-gray-50">
        <p className="text-xs text-gray-500 mb-1 font-medium">{product.category}</p>
        <h3 className="font-medium text-gray-900 leading-tight mb-2 line-clamp-2 min-h-[40px] group-hover:text-[var(--color-brand)] transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center bg-green-700 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
              {product.rating || 'New'} <svg className="w-2.5 h-2.5 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          </div>
          <span className="text-xs text-gray-500">({product.reviews || 0})</span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">{product.formattedPrice}</span>
            {product.originalPrice && <span className="text-xs text-gray-400 line-through ml-2">{product.originalPrice}</span>}
          </div>
        </div>
        
        <button 
          onClick={(e) => addToCart(e, product)}
          className="w-full mt-3 bg-white border border-[var(--color-brand)] text-[var(--color-brand)] font-medium py-1.5 rounded hover:bg-[var(--color-brand)] hover:text-white transition-colors text-sm"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );

  return (
    <main ref={containerRef} className="min-h-screen bg-[var(--color-surface)] pb-20 overflow-x-hidden flex flex-col">
      
      {/* Universal Navigation */}
      <nav className="sticky top-0 z-50 glass-nav px-4 py-4 md:px-8 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link href="/" onClick={() => handleCategoryClick("All")} className="text-2xl font-bold tracking-tight text-[var(--color-brand)] flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            AXORA
          </Link>
          <div className="min-w-0 flex items-center gap-1.5 text-xs text-gray-600">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span className="hidden sm:inline">Deliver to:</span>
            <span className="font-semibold text-gray-900 truncate max-w-[110px] sm:max-w-[180px] md:max-w-[240px]">
              {deliveryLocationText}
            </span>
          </div>
        </div>

        {/* Search Bar (Central) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for products, brands and more..." 
            className="w-full bg-white border border-gray-300 rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent transition-all shadow-sm"
          />
          <button className="absolute right-1 top-1 bottom-1 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white rounded-full px-4 transition-colors flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-5 md:gap-8 text-sm font-medium text-gray-700">
           <Link href="/seller/dashboard" className="flex flex-col items-center hover:text-[var(--color-brand)] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              <span className="hidden md:block mt-1 text-[10px] uppercase tracking-wider">Sell</span>
           </Link>
           {clerkLoaded && isSignedIn ? (
             <div className="flex flex-col items-center gap-1">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                />
                <span className="hidden md:block text-[10px] uppercase tracking-wider">Profile</span>
             </div>
           ) : (
             <SignInButton mode="modal">
               <button className="flex flex-col items-center hover:text-[var(--color-brand)] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15V3"></path><path d="m7 10 5-5 5 5"></path><path d="M5 21h14"></path></svg>
                  <span className="hidden md:block mt-1 text-[10px] uppercase tracking-wider">Login</span>
               </button>
             </SignInButton>
           )}
           <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center hover:text-[var(--color-brand)] transition-colors relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span className="hidden md:block mt-1 text-[10px] uppercase tracking-wider">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[var(--color-accent)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {cartCount}
                </span>
              )}
           </button>
        </div>
      </nav>

      {/* Categories Horizontal Scroll */}
      <div className="bg-white border-b border-gray-200 py-3 shadow-sm sticky top-[73px] z-40">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-8 items-center">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat} 
              onClick={() => handleCategoryClick(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-[var(--color-brand)] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 md:px-8 max-w-[1600px] w-full mx-auto mt-6">
        
        {/* Mobile Search (Visible only on small screens) */}
        <div className="md:hidden relative mb-6">
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search products..." 
            className="w-full bg-white border border-gray-300 rounded-full py-3 pl-5 pr-12 focus:outline-none shadow-sm focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent"
          />
          <button className="absolute right-3 top-3 text-[var(--color-brand)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>

        {/* Content Area */}
        {!isBrowsing ? (
          /* DEFAULT VIEW (Hero + Trending) */
          <div className="space-y-12">
            <section ref={heroGridRef} className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 md:h-[450px]">
               <div className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden group shadow-md cursor-pointer h-[300px] md:h-full">
                 <Image src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop" alt="Big Sale" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                   <span className="bg-[var(--color-accent)] text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-3 uppercase tracking-wider">Mega Sale</span>
                   <h2 className="text-white text-3xl md:text-5xl font-bold mb-2">The Big Billion<br/>Electronics Sale</h2>
                    <p className="text-white/90 mb-6">Up to 80% off on top brands.</p>
                    <button className="bg-white/15 border border-white/60 text-white px-6 py-3 rounded-full font-bold w-max hover:bg-white/25 transition-colors">Shop Now</button>
                 </div>
               </div>
               <div className="md:col-span-2 relative rounded-2xl overflow-hidden group shadow-md cursor-pointer h-[200px] md:h-auto bg-[#fef3c7]">
                  <Image src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop" alt="Fashion" fill className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85" />
                  <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-8 z-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md mb-2">Summer Collection</h3>
                    <p className="text-white/90 drop-shadow-md font-medium mb-4">Starting at ₹499</p>
                    <span className="text-white drop-shadow-md font-bold flex items-center gap-1 group-hover:gap-2 transition-all">Explore <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
                  </div>
               </div>
               <div className="relative rounded-2xl overflow-hidden group shadow-md cursor-pointer h-[180px] md:h-auto bg-blue-50">
                  <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                     <h4 className="text-lg font-bold text-white drop-shadow-md">Home Appliances</h4>
                     <div><span className="bg-black/45 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Min. 30% Off</span></div>
                  </div>
                  <Image src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop" alt="Home" fill className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-65" />
               </div>
               <div className="relative rounded-2xl overflow-hidden group shadow-md cursor-pointer h-[180px] md:h-auto bg-green-50">
                  <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                     <h4 className="text-lg font-bold text-white drop-shadow-md">Fresh Groceries</h4>
                     <div><span className="bg-black/45 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Same Day Delivery</span></div>
                  </div>
                  <Image src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop" alt="Grocery" fill className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-65" />
               </div>
            </section>
            
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {ALL_PRODUCTS.slice(0, 5).map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </section>
            
            {/* Added section to show New Arrivals / Uploaded user products */}
            <section>
              <div className="flex justify-between items-center mb-6 mt-12 border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold tracking-tight">All Products</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {ALL_PRODUCTS.slice(5).map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </section>
          </div>
        ) : (
          /* SEARCH / CATEGORY RESULTS VIEW */
          <div ref={searchResultsRef} className="flex flex-col md:flex-row gap-8">
             {/* Sidebar Filters (Visual UI for typical e-commerce) */}
             <div className="hidden md:block w-64 flex-shrink-0 space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">Filters</h3>
                  <div className="border-t border-gray-200 pt-4">
                     <h4 className="font-medium text-sm text-gray-700 mb-2">Price</h4>
                     <ul className="space-y-2 text-sm text-gray-600">
                       <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-[var(--color-brand)]"/> Under ₹1,000</label></li>
                       <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-[var(--color-brand)]"/> ₹1,000 - ₹5,000</label></li>
                       <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-[var(--color-brand)]"/> ₹5,000 - ₹20,000</label></li>
                       <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-[var(--color-brand)]"/> Over ₹20,000</label></li>
                     </ul>
                  </div>
                </div>
                <div>
                  <div className="border-t border-gray-200 pt-4">
                     <h4 className="font-medium text-sm text-gray-700 mb-2">Customer Ratings</h4>
                     <ul className="space-y-2 text-sm text-gray-600">
                       <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-[var(--color-brand)]"/> 4★ & above</label></li>
                       <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-[var(--color-brand)]"/> 3★ & above</label></li>
                     </ul>
                  </div>
                </div>
             </div>

             {/* Results Grid */}
             <div className="flex-1">
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-4 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                      {activeCategory !== "All" ? activeCategory : "Search Results"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Showing {filteredProducts.length} results {searchQuery && `for "${searchQuery}"`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Sort by:</span>
                    <select className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[var(--color-brand)] bg-white font-medium">
                      <option>Relevance</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Newest Arrivals</option>
                    </select>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="py-20 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-gray-300"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
                    <p>Try adjusting your search or category filter to find what you&apos;re looking for.</p>
                    <button 
                      onClick={() => {setSearchQuery(""); setActiveCategory("All");}} 
                      className="mt-6 px-6 py-2 bg-[var(--color-brand)] text-white rounded-full font-medium hover:bg-[var(--color-brand-hover)] transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm transition-opacity" 
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Cart Drawer Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[101] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             Your Cart
             <span className="bg-gray-100 text-[var(--color-brand)] text-sm py-0.5 px-2.5 rounded-full font-bold">{cartCount} items</span>
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <p className="text-lg">Your cart is empty.</p>
              <button onClick={() => setIsCartOpen(false)} className="px-6 py-2 bg-[var(--color-brand)] text-white font-medium rounded-full hover:bg-[var(--color-brand-hover)] transition-colors">Start Shopping</button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group">
                 <button 
                   onClick={() => removeFromCart(item.product.id)}
                   className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 shadow-sm"
                   title="Remove item"
                 >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
                 <div className="w-20 h-20 relative bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <Image src={item.product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"} alt={item.product.name} fill className="object-contain p-2" />
                 </div>
                 <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 leading-tight line-clamp-2 text-sm">{item.product.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{item.product.formattedPrice}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                       <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white w-max shadow-sm">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-medium transition-colors">-</button>
                          <span className="w-8 text-center font-medium text-sm border-x border-gray-200">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-medium transition-colors">+</button>
                       </div>
                       <p className="font-bold text-[var(--color-brand)]">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-green-600 text-sm font-medium">
                <span>Delivery Charges</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-100">
                <span>Total Amount</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePayNow}
              className="w-full bg-[var(--color-accent)] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-yellow-500 transition-all shadow-sm hover:shadow-md flex justify-center items-center gap-2"
            >
               Pay Now
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        )}
      </div>

      {/* Modern Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white pt-16 pb-8">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-lg mb-4 text-gray-900">About AXORA</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-[var(--color-brand)]">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-brand)]">About Us</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-brand)]">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-gray-900">Help</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-[var(--color-brand)]">Payments</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-brand)]">Shipping</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-brand)]">Cancellation & Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-gray-900">Consumer Policy</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-[var(--color-brand)]">Return Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[var(--color-brand)]">Terms Of Use</Link></li>
                <li><Link href="/privacy" className="hover:text-[var(--color-brand)]">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-gray-900">Newsletter</h4>
              <div className="flex">
                <input type="email" placeholder="Email Address" className="border border-gray-300 rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]" />
                <button className="bg-[var(--color-brand)] text-white px-4 py-2 rounded-r-md font-medium hover:bg-[var(--color-brand-hover)]">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
             <div className="flex items-center gap-2">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-accent)]"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
               <span className="font-bold text-gray-900">AXORA</span>
             </div>
             <p>&copy; {new Date().getFullYear()} Axora.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

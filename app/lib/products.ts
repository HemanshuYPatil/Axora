export type Product = {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  priceInr: number;
  originalPriceInr: number;
  rating: number;
  reviews: number;
  badge?: string;
};

export const TRENDING_PRODUCTS: Product[] = [
  {
    id: "t1",
    name: "Noise Cancelling Headphones V2",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
    description:
      "Premium over-ear headphones with adaptive noise control and 40-hour battery.",
    priceInr: 14999,
    originalPriceInr: 19999,
    rating: 4.8,
    reviews: 1240,
    badge: "Bestseller",
  },
  {
    id: "t2",
    name: 'Ultra HD Smart TV 55"',
    category: "Appliances",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop",
    description:
      "55-inch 4K display with Dolby audio, fast streaming apps, and voice control.",
    priceInr: 42500,
    originalPriceInr: 65000,
    rating: 4.6,
    reviews: 890,
    badge: "50% Off",
  },
  {
    id: "t3",
    name: "Minimalist Casual Sneakers",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    description:
      "Daily wear sneakers built for comfort with lightweight cushioning.",
    priceInr: 2499,
    originalPriceInr: 4999,
    rating: 4.5,
    reviews: 3200,
  },
  {
    id: "t4",
    name: "Pro Gaming Laptop 16GB RAM",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop",
    description:
      "High-performance gaming laptop with fast refresh display and dedicated graphics.",
    priceInr: 89990,
    originalPriceInr: 115000,
    rating: 4.9,
    reviews: 450,
    badge: "New",
  },
  {
    id: "t5",
    name: "Ceramic Coffee Mug Set",
    category: "Home & Kitchen",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop",
    description:
      "Set of premium glazed ceramic mugs for espresso and filter coffee.",
    priceInr: 799,
    originalPriceInr: 1200,
    rating: 4.3,
    reviews: 156,
  },
];

export const NEW_ARRIVALS: Product[] = [
  {
    id: "n1",
    name: "Smart Watch Series 8",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop",
    description:
      "Fitness and health tracking smart watch with always-on AMOLED display.",
    priceInr: 28900,
    originalPriceInr: 32000,
    rating: 4.7,
    reviews: 98,
  },
  {
    id: "n2",
    name: "Organic Cotton T-Shirt",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
    description:
      "Breathable regular-fit t-shirt made from 100% organic cotton.",
    priceInr: 899,
    originalPriceInr: 1499,
    rating: 4.4,
    reviews: 45,
  },
  {
    id: "n3",
    name: "Professional Camera Lens",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",
    description:
      "Fast prime lens designed for low-light portrait and street photography.",
    priceInr: 55000,
    originalPriceInr: 60000,
    rating: 4.9,
    reviews: 21,
  },
  {
    id: "n4",
    name: "Ergonomic Office Chair",
    category: "Furniture",
    image:
      "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800&auto=format&fit=crop",
    description:
      "Adjustable office chair with lumbar support and breathable mesh back.",
    priceInr: 8500,
    originalPriceInr: 12000,
    rating: 4.6,
    reviews: 310,
  },
];

export const ALL_PRODUCTS: Product[] = [...TRENDING_PRODUCTS, ...NEW_ARRIVALS];

export const CATEGORIES: string[] = [
  "All",
  ...new Set(ALL_PRODUCTS.map((product) => product.category)),
];

export const formatInrPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export const getProductById = (id: string) =>
  ALL_PRODUCTS.find((product) => product.id === id);

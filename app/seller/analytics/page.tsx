"use client";

import Link from "next/link";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

const REVENUE_DATA = [
  { name: "Jan", revenue: 12000 },
  { name: "Feb", revenue: 19000 },
  { name: "Mar", revenue: 15000 },
  { name: "Apr", revenue: 22000 },
  { name: "May", revenue: 28000 },
  { name: "Jun", revenue: 35000 },
  { name: "Jul", revenue: 42000 },
];

const CATEGORY_DATA = [
  { name: "Electronics", sales: 420 },
  { name: "Fashion", sales: 310 },
  { name: "Appliances", sales: 150 },
  { name: "Home", sales: 280 },
  { name: "Books", sales: 190 },
];

const RECENT_ORDERS = [
  { id: "#ORD-8923", product: "Noise Cancelling Headphones", date: "Today, 10:23 AM", amount: "₹14,999", status: "Delivered" },
  { id: "#ORD-8924", product: "Minimalist Sneakers", date: "Today, 11:45 AM", amount: "₹2,499", status: "Processing" },
  { id: "#ORD-8925", product: "Pro Gaming Laptop", date: "Yesterday, 04:12 PM", amount: "₹89,990", status: "Shipped" },
  { id: "#ORD-8926", product: "Smart Watch Series 8", date: "Yesterday, 06:30 PM", amount: "₹28,900", status: "Delivered" },
];

export default function SellerAnalytics() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-12 font-sans">
      {/* Seller Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4 md:px-8 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[var(--color-brand)] flex items-center gap-2">
            AXORA <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded ml-2">Seller</span>
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/seller/dashboard" className="text-gray-600 hover:text-[var(--color-brand)] transition-colors px-3 py-2 rounded-lg">
            Upload Products
          </Link>
          <Link href="/seller/analytics" className="text-[var(--color-brand)] bg-blue-50 px-3 py-2 rounded-lg transition-colors">
            Analytics
          </Link>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto mt-8 px-4 md:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Overview</h1>
          <p className="text-gray-500">Track your store&apos;s growth and sales metrics.</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Revenue", value: "₹1,73,000", trend: "+14.5%", positive: true },
            { label: "Orders", value: "1,248", trend: "+8.2%", positive: true },
            { label: "Active Products", value: "45", trend: "+2", positive: true },
            { label: "Customer Returns", value: "12", trend: "-1.5%", positive: true /* lower is better */ },
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-gray-900">{kpi.value}</h3>
                <span className={`text-sm font-bold ${kpi.positive ? 'text-green-600' : 'text-red-600'} bg-${kpi.positive ? 'green' : 'red'}-50 px-2 py-0.5 rounded`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Over Time (Last 7 Months)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={REVENUE_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 12}}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => {
                      const safeValue =
                        typeof value === "number" ? value : Number(value ?? 0);
                      return [`₹${safeValue.toLocaleString("en-IN")}`, "Revenue"];
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-brand)" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Sales by Category</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12, fontWeight: 500}} />
                  <RechartsTooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="sales" fill="var(--color-accent)" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <button className="text-sm font-medium text-[var(--color-brand)] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {RECENT_ORDERS.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-gray-700">{order.product}</td>
                    <td className="px-6 py-4 text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

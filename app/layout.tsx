import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Chatbot from "@/components/Chatbot";
import ConvexClientProvider from "./ConvexClientProvider";
import AuthUserSync from "./components/auth-user-sync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AXORA | The Everything Store",
  description: "Modern, animated e-commerce experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-[#f8f9fa] text-[#111827]`}
      >
        <ConvexClientProvider>
          <ClerkProvider>
            <AuthUserSync />
            {children}
          </ClerkProvider>
          <Chatbot />
        </ConvexClientProvider>
      </body>
    </html>
  );
}

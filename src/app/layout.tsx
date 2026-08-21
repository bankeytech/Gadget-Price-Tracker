import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gadget Price Tracker | Live Used Tech Resale Deals & Trends",
  description:
    "Track resale prices for used smartphones, laptops, headphones, and gaming consoles across sellers over time. Spot the cheapest deals and track price drops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#090d16] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}

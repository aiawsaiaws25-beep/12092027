import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "CineBook - Premium Cinema Ticket Booking",
  description:
    "Experience the ultimate cinema ticket booking platform. Real-time seat selection, zero double-booking tolerance, and instant digital QR tickets.",
  keywords: ["cinema booking", "movies", "showtimes", "seat selection", "IMAX tickets", "CineBook"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-cinema-dark text-slate-100 flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

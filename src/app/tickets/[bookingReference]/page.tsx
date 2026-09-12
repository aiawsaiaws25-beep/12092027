"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { TicketPass } from "@/components/TicketPass";
import { Booking, Ticket } from "@/lib/types";
import {
  CheckCircle2,
  Ticket as TicketIcon,
  ChevronLeft,
  Calendar,
  Sparkles,
  AlertCircle,
  Loader2,
  Film,
} from "lucide-react";

function TicketConfirmationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reference = params.bookingReference as string;
  const isJustConfirmed = searchParams.get("confirmed") === "true";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTicketData() {
      try {
        const res = await fetch(`/api/bookings/ref/${reference}`);
        if (!res.ok) throw new Error("Ticket pass not found");
        const data = await res.json();
        setBooking(data.booking);
        setTickets(data.booking.tickets || []);

        if (isJustConfirmed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#f59e0b", "#fbbf24", "#10b981", "#3b82f6"],
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load digital ticket");
      } finally {
        setLoading(false);
      }
    }

    loadTicketData();
  }, [reference, isJustConfirmed]);

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center space-y-4">
        <Loader2 className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading your verified digital cinema pass...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen py-24 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Ticket Not Found</h2>
        <p className="text-xs text-slate-400">
          We could not locate a confirmed booking with reference {reference}.
        </p>
        <Link
          href="/movies"
          className="inline-block rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950"
        >
          Explore Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cinema-border pb-6">
        <div>
          <Link
            href="/account/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors mb-1"
          >
            <ChevronLeft className="h-4 w-4" />
            View All My Bookings
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <TicketIcon className="h-7 w-7 text-amber-400" />
            Confirmed Digital Passes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Booking Reference: <span className="font-mono text-white font-bold">{booking.bookingReference}</span>
          </p>
        </div>

        {isJustConfirmed && (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 border border-emerald-500/20 shadow-inner">
            <CheckCircle2 className="h-4 w-4" />
            Booking & Payment Succeeded
          </div>
        )}
      </div>

      {/* Ticket Pass View */}
      <TicketPass booking={booking} tickets={tickets} />
    </div>
  );
}

export default function TicketConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-24 text-center space-y-4">
          <Loader2 className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading tickets...</p>
        </div>
      }
    >
      <TicketConfirmationContent />
    </Suspense>
  );
}

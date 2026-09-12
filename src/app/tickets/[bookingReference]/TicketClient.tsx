"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { TicketPass } from "@/components/TicketPass";
import { Booking, Ticket } from "@/lib/types";
import { SAMPLE_MOVIES, SAMPLE_CINEMAS } from "@/db/seed-data";
import {
  CheckCircle2,
  Ticket as TicketIcon,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";

function TicketConfirmationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reference = (params?.bookingReference as string) || "CB-DEMO";
  const isJustConfirmed = searchParams?.get("confirmed") === "true";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTicketData() {
      try {
        const res = await fetch(`/api/bookings/ref/${reference}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data.booking);
          setTickets(data.booking.tickets || []);
        } else {
          throw new Error("Static fallback");
        }
      } catch {
        const movie = SAMPLE_MOVIES[0];
        const cinema = SAMPLE_CINEMAS[0];
        const aud = cinema.auditoriums[0];

        const mockTickets: Ticket[] = [
          {
            id: `tck-1`,
            bookingId: `b-1`,
            showtimeSeatId: `sts-1`,
            ticketCode: `TCK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            qrCodeData: JSON.stringify({
              code: "TCK-DEMO",
              ref: reference,
              seat: "E4",
              movie: movie.title,
              showtime: new Date().toISOString(),
              cinema: cinema.name,
              auditorium: aud.name,
            }),
            isUsed: false,
            createdAt: new Date().toISOString(),
            seatLabel: "E4",
            movieTitle: movie.title,
            cinemaName: cinema.name,
            auditoriumName: aud.name,
            startTime: new Date().toISOString(),
          },
          {
            id: `tck-2`,
            bookingId: `b-1`,
            showtimeSeatId: `sts-2`,
            ticketCode: `TCK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            qrCodeData: JSON.stringify({
              code: "TCK-DEMO2",
              ref: reference,
              seat: "E5",
              movie: movie.title,
              showtime: new Date().toISOString(),
              cinema: cinema.name,
              auditorium: aud.name,
            }),
            isUsed: false,
            createdAt: new Date().toISOString(),
            seatLabel: "E5",
            movieTitle: movie.title,
            cinemaName: cinema.name,
            auditoriumName: aud.name,
            startTime: new Date().toISOString(),
          },
        ];

        const mockBooking: Booking = {
          id: `b-demo`,
          bookingReference: reference,
          userId: "u-demo",
          showtimeId: "st-demo",
          status: "CONFIRMED",
          subtotalCents: 3200,
          feeCents: 300,
          taxCents: 160,
          totalCents: 3660,
          expiresAt: new Date(Date.now() + 10 * 60000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tickets: mockTickets,
          showtime: {
            id: "st-demo",
            movieId: movie.id,
            auditoriumId: aud.id,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 140 * 60000).toISOString(),
            basePriceCents: 1600,
            format: "IMAX",
            status: "SCHEDULED",
            movie,
            auditorium: {
              ...aud,
              cinemaId: cinema.id,
              cinema,
            },
          },
        };

        setBooking(mockBooking);
        setTickets(mockTickets);
      } finally {
        setLoading(false);
      }

      if (isJustConfirmed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#fbbf24", "#10b981", "#3b82f6"],
        });
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

        <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 border border-emerald-500/20 shadow-inner">
          <CheckCircle2 className="h-4 w-4" />
          Booking & Payment Succeeded
        </div>
      </div>

      <TicketPass booking={booking} tickets={tickets} />
    </div>
  );
}

export default function TicketClient() {
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

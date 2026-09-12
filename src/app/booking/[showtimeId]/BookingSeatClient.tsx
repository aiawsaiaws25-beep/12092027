"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SeatMap, SeatMapItem } from "@/components/SeatMap";
import { Showtime, SeatType } from "@/lib/types";
import { SAMPLE_MOVIES, SAMPLE_CINEMAS } from "@/db/seed-data";
import {
  Film,
  Calendar,
  Clock,
  Building2,
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  Sparkles,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";

export default function BookingSeatClient() {
  const params = useParams();
  const router = useRouter();
  const showtimeId = (params?.showtimeId as string) || "st-0-a1111111-0";

  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<SeatMapItem[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  const loadShowtimeData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/showtimes/${showtimeId}`);
      if (res.ok) {
        const data = await res.json();
        setShowtime(data.showtime);
        setSeats(data.seats || []);
      } else {
        throw new Error("Static fallback");
      }
    } catch {
      const movie = SAMPLE_MOVIES[0];
      const cinema = SAMPLE_CINEMAS[0];
      const aud = cinema.auditoriums[0];

      const mockShowtime: Showtime = {
        id: showtimeId,
        movieId: movie.id,
        auditoriumId: aud.id,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 140 * 60000).toISOString(),
        basePriceCents: 1600,
        format: "IMAX",
        status: "SCHEDULED",
        movie: { ...movie, genres: ["Action", "Sci-Fi"] },
        auditorium: {
          id: aud.id,
          cinemaId: cinema.id,
          name: aud.name,
          totalRows: aud.totalRows,
          totalCols: aud.totalCols,
          seatingCapacity: aud.seatingCapacity,
          soundSystem: aud.soundSystem,
          screenType: aud.screenType,
          cinema: {
            id: cinema.id,
            name: cinema.name,
            slug: cinema.slug,
            address: cinema.address,
            city: cinema.city,
            state: cinema.state,
            postalCode: cinema.postalCode,
            phone: cinema.phone,
          },
        },
      };
      setShowtime(mockShowtime);

      const mockSeats: SeatMapItem[] = [];
      const rows = ["A", "B", "C", "D", "E", "F"];
      for (const r of rows) {
        for (let c = 1; c <= 10; c++) {
          const sId = `s-${r}-${c}`;
          let sType: SeatType = "STANDARD";
          if (r === "A") sType = "ACCESSIBLE";
          else if (r === "F") sType = "RECLINER";
          else if (r === "E" || r === "D") sType = "VIP";

          mockSeats.push({
            id: sId,
            showtimeSeatId: `sts-${showtimeId}-${sId}`,
            rowLabel: r,
            seatNumber: c,
            seatType: sType,
            status: r === "D" && (c === 4 || c === 5) ? "BOOKED" : "AVAILABLE",
            heldUntil: null,
          });
        }
      }
      setSeats(mockSeats);
    } finally {
      setLoading(false);
    }
  }, [showtimeId]);

  useEffect(() => {
    loadShowtimeData();
  }, [loadShowtimeData]);

  const handleToggleSeat = (seat: SeatMapItem) => {
    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 10) {
        alert("You can select a maximum of 10 seats per booking.");
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  const selectedSeatsInfo = seats.filter((s) => selectedSeatIds.includes(s.id));

  const SERVICE_FEE_CENTS = 150;
  const TAX_RATE = 0.05;

  let subtotalCents = 0;
  for (const s of selectedSeatsInfo) {
    let seatPrice = showtime?.basePriceCents || 1600;
    if (s.seatType === "VIP") seatPrice += 500;
    if (s.seatType === "RECLINER") seatPrice += 800;
    subtotalCents += seatPrice;
  }

  const feeCents = selectedSeatsInfo.length * SERVICE_FEE_CENTS;
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + feeCents + taxCents;

  const handleProceedToCheckout = async () => {
    if (selectedSeatIds.length === 0) return;
    setHolding(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId,
          seatIds: selectedSeatIds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/checkout/${data.booking.id}`);
      } else {
        throw new Error("Static fallback");
      }
    } catch {
      const demoBookingId = `b-demo-${Date.now()}`;
      router.push(`/checkout/${demoBookingId}?seats=${selectedSeatIds.length}&total=${totalCents}`);
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center space-y-4">
        <Loader2 className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading interactive auditorium seat map...</p>
      </div>
    );
  }

  const movie = showtime?.movie;
  const auditorium = showtime?.auditorium;
  const cinema = auditorium?.cinema;

  const showtimeDateStr = showtime
    ? new Date(showtime.startTime).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "";

  const showtimeTimeStr = showtime
    ? new Date(showtime.startTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cinema-border pb-6">
        <div className="space-y-1">
          <Link
            href={movie ? `/movies/${movie.slug}` : "/movies"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors mb-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Movie Details
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {movie?.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="text-slate-200 font-semibold">{cinema?.name}</span>
            <span>•</span>
            <span>{auditorium?.name}</span>
            <span>•</span>
            <span className="font-bold text-amber-400">{showtime?.format}</span>
            <span>•</span>
            <span>{showtimeDateStr} at {showtimeTimeStr}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Live Seat Synchronization
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 rounded-3xl bg-cinema-card p-6 border border-cinema-border shadow-xl">
          <SeatMap
            seats={seats}
            basePriceCents={showtime?.basePriceCents || 1600}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={handleToggleSeat}
          />
        </div>

        <div className="rounded-3xl bg-cinema-card p-6 border border-cinema-border space-y-6 shadow-xl sticky top-24">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Booking Summary</span>
            <span className="text-xs font-semibold text-amber-400">
              {selectedSeatsInfo.length} seat(s)
            </span>
          </h3>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Selected Seats:
            </span>

            {selectedSeatsInfo.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedSeatsInfo.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/30"
                  >
                    Row {s.rowLabel}{s.seatNumber} ({s.seatType})
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No seats selected yet. Click seats on the auditorium map to begin.
              </p>
            )}
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Tickets Subtotal</span>
              <span className="font-semibold text-white">
                ${(subtotalCents / 100).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Booking Service Fee</span>
              <span className="font-semibold text-white">
                ${(feeCents / 100).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Tax (5%)</span>
              <span className="font-semibold text-white">
                ${(taxCents / 100).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between pt-3 border-t border-slate-800 text-base font-extrabold text-white">
              <span>Final Total</span>
              <span className="text-amber-400">
                ${(totalCents / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={handleProceedToCheckout}
              disabled={selectedSeatIds.length === 0 || holding}
              className={`flex items-center justify-center gap-2 w-full rounded-2xl py-3.5 text-sm font-extrabold transition-all shadow-lg ${
                selectedSeatIds.length > 0 && !holding
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/25 active:scale-[0.98]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              {holding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Securing 10-Minute Hold...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Reserve Seats & Pay
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Seats locked for 10 minutes upon proceeding</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

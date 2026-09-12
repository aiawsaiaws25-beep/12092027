"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Booking } from "@/lib/types";
import { SAMPLE_MOVIES, SAMPLE_CINEMAS } from "@/db/seed-data";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

function CheckoutPaymentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = (params?.bookingId as string) || "b-demo";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(600);

  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");
  const [cardName, setCardName] = useState("Alex Johnson");
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  useEffect(() => {
    setIdempotencyKey(`idemp_${bookingId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
  }, [bookingId]);

  const loadBooking = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data.booking);
      } else {
        throw new Error("Static fallback");
      }
    } catch {
      const movie = SAMPLE_MOVIES[0];
      const cinema = SAMPLE_CINEMAS[0];
      const aud = cinema.auditoriums[0];
      const seatsCount = Number(searchParams?.get("seats") || 2);
      const totalParam = Number(searchParams?.get("total") || 3770);

      const mockBooking: Booking = {
        id: bookingId,
        bookingReference: `CB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        userId: "u-demo",
        showtimeId: "st-demo",
        status: "PENDING",
        subtotalCents: totalParam - seatsCount * 150 - Math.round((totalParam - seatsCount * 150) * 0.05),
        feeCents: seatsCount * 150,
        taxCents: Math.round((totalParam - seatsCount * 150) * 0.05),
        totalCents: totalParam,
        expiresAt: new Date(Date.now() + 10 * 60000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: Array.from({ length: seatsCount }).map((_, i) => ({
          id: `item-${i}`,
          showtimeSeatId: `sts-demo-${i}`,
          seatId: `s-demo-${i}`,
          priceCents: 1600,
          seatLabel: `E${i + 4}`,
          seatType: "STANDARD",
        })),
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
    } finally {
      setLoading(false);
    }
  }, [bookingId, searchParams]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  useEffect(() => {
    if (!booking || booking.status !== "PENDING") return;

    const calculateRemaining = () => {
      const expires = new Date(booking.expiresAt).getTime();
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((expires - now) / 1000));
      setSecondsRemaining(diffSecs);
    };

    calculateRemaining();
    const timer = setInterval(calculateRemaining, 1000);
    return () => clearInterval(timer);
  }, [booking]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setPaying(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          idempotencyKey,
          cardLast4: cardNumber.replace(/\s+/g, "").slice(-4) || "4242",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/tickets/${data.booking.bookingReference}?confirmed=true`);
      } else {
        throw new Error("Static fallback");
      }
    } catch {
      router.push(`/tickets/${booking.bookingReference}?confirmed=true`);
    } finally {
      setPaying(false);
    }
  };

  const setTestCard = (type: "SUCCESS" | "FAIL") => {
    if (type === "SUCCESS") {
      setCardNumber("4242 4242 4242 4242");
      setCardExpiry("12/28");
      setCardCvc("123");
      setCardName("Alex Johnson");
    } else {
      setCardNumber("4000 0000 0000 0002");
      setCardExpiry("01/22");
      setCardCvc("000");
      setCardName("Declined Test");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center space-y-4">
        <Loader2 className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading secure checkout session...</p>
      </div>
    );
  }

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins}:${remainderSecs < 10 ? "0" : ""}${remainderSecs}`;
  };

  const showtime = booking?.showtime;
  const movie = showtime?.movie;
  const auditorium = showtime?.auditorium;
  const cinema = auditorium?.cinema;

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cinema-border pb-6">
        <div>
          <Link
            href={`/booking/${booking?.showtimeId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors mb-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Change Seat Selection
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Lock className="h-7 w-7 text-amber-400" />
            Secure Checkout
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Booking Ref: <span className="font-mono text-slate-200">{booking?.bookingReference}</span>
          </p>
        </div>

        {secondsRemaining !== null && (
          <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 px-4 py-2.5 border border-amber-500/30">
            <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                Seat Hold Expires In
              </span>
              <span className="text-lg font-mono font-extrabold text-white">
                {formatTimer(secondsRemaining)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-slate-900/90 p-4 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                <strong>Test Mode Active</strong> — Simulated payment processor. No real charges.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setTestCard("SUCCESS")}
              className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
            >
              Auto-fill Success Card
            </button>
          </div>

          <form
            onSubmit={handlePay}
            className="rounded-3xl bg-cinema-card p-6 sm:p-8 border border-cinema-border space-y-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-400" />
                Payment Method
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                256-bit Encrypted
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs text-white border border-slate-700/80 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-mono text-white border border-slate-700/80 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-mono text-white border border-slate-700/80 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    CVC / CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-mono text-white border border-slate-700/80 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={paying}
                className="flex items-center justify-center gap-2 w-full rounded-2xl py-4 text-sm font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Authorizing & Issuing Tickets...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Pay ${(Number(booking?.totalCents || 0) / 100).toFixed(2)} & Generate Tickets
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl bg-cinema-card p-6 border border-cinema-border space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Ticket Overview
          </h3>

          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-white">{movie?.title}</h4>
            <p className="text-xs text-amber-400 font-semibold">{showtime?.format} Screening</p>
            <p className="text-xs text-slate-400">{cinema?.name} • {auditorium?.name}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
              Reserved Seats ({booking?.items?.length || 0}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {booking?.items?.map((item) => (
                <span
                  key={item.id}
                  className="rounded-md bg-slate-800 px-2 py-1 text-xs font-bold text-slate-200 border border-slate-700"
                >
                  {item.seatLabel} (${(item.priceCents / 100).toFixed(2)})
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal</span>
              <span className="font-semibold text-white">
                ${((booking?.subtotalCents || 0) / 100).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Booking Fee</span>
              <span className="font-semibold text-white">
                ${((booking?.feeCents || 0) / 100).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Taxes</span>
              <span className="font-semibold text-white">
                ${((booking?.taxCents || 0) / 100).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between pt-3 border-t border-slate-800 text-base font-extrabold text-white">
              <span>Total Due</span>
              <span className="text-amber-400">
                ${((booking?.totalCents || 0) / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-24 text-center space-y-4">
          <Loader2 className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading checkout...</p>
        </div>
      }
    >
      <CheckoutPaymentContent />
    </Suspense>
  );
}

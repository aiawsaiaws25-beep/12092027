"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Booking } from "@/lib/types";
import {
  Ticket,
  Film,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function AccountBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/account/bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking and initiate a full refund?")) {
      return;
    }

    setCancellingBookingId(bookingId);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel booking.");
      }

      setActionSuccess("Booking successfully cancelled and seats released.");
      fetchBookings();
    } catch (err: any) {
      setActionError(err.message || "Failed to cancel booking.");
    } finally {
      setCancellingBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center space-y-4">
        <Loader2 className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading your cinema bookings history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cinema-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Ticket className="h-8 w-8 text-amber-400" />
            My Cinema Bookings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your movie tickets, access digital QR passes, and handle booking cancellations
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchBookings();
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 border border-slate-800 hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
          Refresh
        </button>
      </div>

      {/* Notification banners */}
      {actionSuccess && (
        <div className="rounded-2xl bg-emerald-950/60 p-4 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl bg-rose-950/60 p-4 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const movie = booking.showtime?.movie;
            const auditorium = booking.showtime?.auditorium;
            const cinema = auditorium?.cinema;

            const isConfirmed = booking.status === "CONFIRMED";
            const isCancelled = booking.status === "CANCELLED";
            const isExpired = booking.status === "EXPIRED";

            const showDate = booking.showtime
              ? new Date(booking.showtime.startTime).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : "";

            const showTime = booking.showtime
              ? new Date(booking.showtime.startTime).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={booking.id}
                className="rounded-3xl bg-cinema-card p-6 border border-cinema-border space-y-4 hover:border-slate-700 transition-all shadow-xl"
              >
                {/* Top status bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-300">
                      Ref: {booking.bookingReference}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">
                      Booked {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                      isConfirmed
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : isCancelled
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        : isExpired
                        ? "bg-slate-800 text-slate-500 border border-slate-700"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                {/* Booking Content Details */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white">{movie?.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="font-semibold text-amber-400">
                        {booking.showtime?.format}
                      </span>
                      <span>•</span>
                      <span>{showDate} at {showTime}</span>
                      <span>•</span>
                      <span>{cinema?.name} ({auditorium?.name})</span>
                    </div>

                    {/* Seat items */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {booking.items?.map((item) => (
                        <span
                          key={item.id}
                          className="rounded bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-slate-300 border border-slate-800"
                        >
                          Seat {item.seatLabel} ({item.seatType})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Info */}
                  <div className="text-left sm:text-right space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Total Paid
                    </span>
                    <span className="text-xl font-extrabold text-white">
                      ${(booking.totalCents / 100).toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {booking.items?.length || 0} Ticket(s)
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
                  {isConfirmed && (
                    <>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingBookingId === booking.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                      >
                        {cancellingBookingId === booking.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        Cancel Booking
                      </button>

                      <Link
                        href={`/tickets/${booking.bookingReference}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow hover:from-amber-400 hover:to-amber-500 transition-all"
                      >
                        <QrCode className="h-4 w-4" />
                        View QR Tickets
                      </Link>
                    </>
                  )}

                  {booking.status === "PENDING" && (
                    <Link
                      href={`/checkout/${booking.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950"
                    >
                      Complete Checkout
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl bg-cinema-card p-12 text-center border border-cinema-border space-y-4">
          <Ticket className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Bookings Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't reserved any cinema tickets yet. Explore movies and pick your favorite seats!
          </p>
          <Link
            href="/movies"
            className="inline-block rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950"
          >
            Find a Movie
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Booking } from "@/lib/types";
import {
  Ticket,
  Search,
  ChevronLeft,
  RefreshCw,
  QrCode,
  DollarSign,
  User,
  Calendar,
  Filter,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadBookings = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (statusFilter !== "ALL") query.append("status", statusFilter);

      const res = await fetch(`/api/admin/bookings?${query.toString()}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    loadBookings();
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cinema-border pb-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors mb-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Admin Suite
          </Link>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Ticket className="h-8 w-8 text-amber-400" />
            Live Bookings & Seat Inspector
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit customer transactions, seat assignments, and payment records across all venues
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            loadBookings();
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 border border-slate-800 hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
          Refresh Stream
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-cinema-card p-4 border border-cinema-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search reference, customer, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-3xl bg-cinema-card border border-cinema-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Movie & Showtime</th>
                <th className="px-6 py-4">Seats</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-white">
                    {b.bookingReference}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-200">{b.user?.name || "Guest"}</p>
                    <p className="text-[10px] text-slate-500">{b.user?.email || "No email"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white line-clamp-1">
                      {b.showtime?.movie?.title || "Movie"}
                    </p>
                    <p className="text-[11px] text-amber-400">
                      {b.showtime ? new Date(b.showtime.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""} • {b.showtime?.format}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {b.items?.map((item) => (
                        <span
                          key={item.id}
                          className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-700"
                        >
                          {item.seatLabel}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    ${(b.totalCents / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        b.status === "CONFIRMED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : b.status === "CANCELLED"
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {b.status === "CONFIRMED" && (
                      <Link
                        href={`/tickets/${b.bookingReference}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

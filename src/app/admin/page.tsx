"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Ticket,
  Film,
  Building2,
  Calendar,
  Activity,
  ShieldCheck,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);

  const loadMetrics = async () => {
    try {
      const res = await fetch("/api/admin/metrics");
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const triggerHoldCleanup = async () => {
    setCleaning(true);
    setCleanupResult(null);
    try {
      const res = await fetch("/api/cron/release-expired-holds", { method: "POST" });
      const result = await res.json();
      setCleanupResult(result.message || `Cleaned up ${result.releasedSeats || 0} expired holds`);
      loadMetrics();
    } catch (err: any) {
      setCleanupResult("Error executing cleanup");
    } finally {
      setCleaning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center space-y-4">
        <Activity className="h-10 w-10 text-amber-400 animate-pulse mx-auto" />
        <p className="text-sm text-slate-400">Loading cinema management metrics...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalGrossRevenueCents: 0,
    totalBookingsCount: 0,
    confirmedBookingsCount: 0,
    totalTicketsSold: 0,
    activeShowtimesCount: 0,
    occupancyRate: 0,
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cinema-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
              Operations Center
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live DB Synced
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Cinema Management Suite
          </h1>
          <p className="text-xs text-slate-400">
            Real-time analytics, showtime orchestration, and seat inventory controls
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={triggerHoldCleanup}
            disabled={cleaning}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-amber-400 border border-slate-700 hover:border-amber-400/40 transition-all disabled:opacity-50"
          >
            <Clock className={`h-4 w-4 ${cleaning ? "animate-spin" : ""}`} />
            Release Expired Holds
          </button>

          <Link
            href="/admin/showtimes"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            Schedule Showtime
          </Link>
        </div>
      </div>

      {cleanupResult && (
        <div className="rounded-2xl bg-slate-900 p-4 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{cleanupResult}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Revenue */}
        <div className="rounded-3xl bg-cinema-card p-6 border border-cinema-border space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Gross Revenue</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${(metrics.totalGrossRevenueCents / 100).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500">
            From {metrics.confirmedBookingsCount} confirmed bookings
          </p>
        </div>

        {/* Tickets Sold */}
        <div className="rounded-3xl bg-cinema-card p-6 border border-cinema-border space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Tickets Issued</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Ticket className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics.totalTicketsSold}
          </div>
          <p className="text-[11px] text-slate-500">
            Across all screen auditoriums
          </p>
        </div>

        {/* Active Screenings */}
        <div className="rounded-3xl bg-cinema-card p-6 border border-cinema-border space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Active Showtimes</span>
            <div className="h-8 w-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics.activeShowtimesCount}
          </div>
          <p className="text-[11px] text-slate-500">
            Scheduled across 7 days
          </p>
        </div>

        {/* Est. Occupancy */}
        <div className="rounded-3xl bg-cinema-card p-6 border border-cinema-border space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Auditorium Occupancy</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics.occupancyRate}%
          </div>
          <p className="text-[11px] text-slate-500">
            Average seat utilization
          </p>
        </div>
      </div>

      {/* Admin Quick Navigation Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/movies"
          className="rounded-3xl bg-cinema-card p-6 border border-cinema-border hover:border-amber-400/40 transition-all space-y-2 group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Film className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-amber-400">
                Movie Catalogue Manager
              </h3>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400" />
          </div>
          <p className="text-xs text-slate-400">
            Add new titles, update synopsis, release dates, and trailer streams.
          </p>
        </Link>

        <Link
          href="/admin/showtimes"
          className="rounded-3xl bg-cinema-card p-6 border border-cinema-border hover:border-amber-400/40 transition-all space-y-2 group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-sky-400">
                Showtime Scheduler
              </h3>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400" />
          </div>
          <p className="text-xs text-slate-400">
            Schedule 2D, 3D, IMAX Laser screenings and configure base prices.
          </p>
        </Link>

        <Link
          href="/admin/bookings"
          className="rounded-3xl bg-cinema-card p-6 border border-cinema-border hover:border-amber-400/40 transition-all space-y-2 group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Ticket className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-emerald-400">
                Live Bookings Stream
              </h3>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400">
            Inspect all transactions, ticket issuance, and customer reservation statuses.
          </p>
        </Link>
      </div>

      {/* Recent Bookings & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings Stream */}
        <div className="rounded-3xl bg-cinema-card p-6 border border-cinema-border space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
            <span>Recent System Bookings</span>
            <Link
              href="/admin/bookings"
              className="text-xs text-amber-400 hover:underline"
            >
              View All
            </Link>
          </h3>

          <div className="space-y-3">
            {(data?.recentBookings || []).slice(0, 5).map((b: any) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">
                      {b.bookingReference}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        b.status === "CONFIRMED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    {b.showtime?.movie?.title || "Movie"} • {b.user?.name || "Guest"}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-white">
                    ${(b.totalCents / 100).toFixed(2)}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    {new Date(b.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Trail */}
        <div className="rounded-3xl bg-cinema-card p-6 border border-cinema-border space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Audit Activity Trail
          </h3>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {(data?.auditLogs || []).map((log: any) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800/80 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-amber-400">
                    {log.action}
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Entity: {log.entityType} ({log.entityId.slice(0, 12)}...)
                  </p>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { HeroBanner } from "@/components/HeroBanner";
import { MovieCard } from "@/components/MovieCard";
import {
  Film,
  Sparkles,
  ShieldCheck,
  Zap,
  CreditCard,
  Building2,
  Calendar,
  ArrowRight,
  Flame,
} from "lucide-react";

export default async function HomePage() {
  await store.init();
  const allMovies = Array.from(store.movies.values());
  const nowShowing = allMovies.filter((m) => m.status === "NOW_SHOWING");
  const comingSoon = allMovies.filter((m) => m.status === "COMING_SOON");
  const cinemas = Array.from(store.cinemas.values());

  const featuredMovie = nowShowing[0] || allMovies[0];

  return (
    <div className="min-h-screen space-y-16 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Featured Hero Banner */}
      {featuredMovie && <HeroBanner featuredMovie={featuredMovie} />}

      {/* Value Proposition Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 rounded-2xl bg-cinema-card p-4 border border-cinema-border">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Instant Seat Locks</h4>
            <p className="text-[11px] text-slate-400">10-minute reserved holds</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-cinema-card p-4 border border-cinema-border">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Zero Double-Booking</h4>
            <p className="text-[11px] text-slate-400">Atomic row concurrency</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-cinema-card p-4 border border-cinema-border">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Exact Minor Units</h4>
            <p className="text-[11px] text-slate-400">Zero float precision errors</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-cinema-card p-4 border border-cinema-border">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Digital QR Passes</h4>
            <p className="text-[11px] text-slate-400">Paperless entrance scan</p>
          </div>
        </div>
      </div>

      {/* Now Showing Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Flame className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Now Showing in Theatres
              </h2>
              <p className="text-xs text-slate-400">
                Live screening schedules with accurate real-time seat availability
              </p>
            </div>
          </div>

          <Link
            href="/movies"
            className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            View All Movies
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {nowShowing.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Upcoming Blockbusters
                </h2>
                <p className="text-xs text-slate-400">
                  Anticipated theatrical premieres opening soon
                </p>
              </div>
            </div>

            <Link
              href="/movies?status=COMING_SOON"
              className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
            >
              Explore Calendar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoon.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Cinemas Directory */}
      <section className="rounded-3xl bg-cinema-card p-8 border border-cinema-border space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Experience Premium Theatres</h3>
              <p className="text-xs text-slate-400">
                Featuring IMAX Laser, Dolby Atmos 128-channel, VIP Recliner Lounges, and 4DX
              </p>
            </div>
          </div>

          <Link
            href="/cinemas"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700"
          >
            All Cinema Locations
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cinemas.map((cinema) => (
            <div
              key={cinema.id}
              className="rounded-2xl bg-slate-900/80 p-5 border border-slate-800 space-y-3 hover:border-amber-400/30 transition-all"
            >
              <h4 className="font-bold text-white text-base">{cinema.name}</h4>
              <p className="text-xs text-slate-400">
                {cinema.address}, {cinema.city}, {cinema.state} {cinema.postalCode}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                  Dolby Atmos
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                  IMAX Laser
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-purple-300">
                  VIP Lounges
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Movie, Showtime, Cinema, Auditorium } from "@/lib/types";
import {
  Clock,
  Calendar,
  Building2,
  Film,
  Sparkles,
  Play,
  Ticket,
  MapPin,
  ChevronRight,
  Info,
} from "lucide-react";

export default function MovieDetailPage() {
  const params = useParams();
  const slugOrId = params.slug as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [cinemasWithShowtimes, setCinemasWithShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedCinemaFilter, setSelectedCinemaFilter] = useState("ALL");

  useEffect(() => {
    async function loadMovie() {
      try {
        const res = await fetch(`/api/movies/${slugOrId}`);
        if (!res.ok) throw new Error("Failed to load movie");
        const data = await res.json();
        setMovie(data.movie);
        setCinemasWithShowtimes(data.cinemasWithShowtimes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMovie();
  }, [slugOrId]);

  // Next 7 days list
  const next7Days = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        dateObj: d,
        dayName: i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
        dateStr: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        isoDay: d.toISOString().split("T")[0],
      });
    }
    return dates;
  }, []);

  const selectedDateIso = next7Days[selectedDateIndex]?.isoDay;

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center space-y-4">
        <Film className="h-12 w-12 text-amber-400 animate-pulse mx-auto" />
        <p className="text-sm text-slate-400">Loading movie screenings & showtimes...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen py-24 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested movie could not be found or has concluded its theatrical run.
        </p>
        <Link
          href="/movies"
          className="inline-block rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950"
        >
          Browse All Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Backdrop Banner */}
      <div className="relative w-full h-[380px] sm:h-[460px] bg-slate-950 overflow-hidden border-b border-cinema-border">
        {movie.backdropUrl && (
          <Image
            src={movie.backdropUrl}
            alt={movie.title}
            fill
            priority
            className="object-cover object-center opacity-30 filter brightness-90"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-cinema-dark/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-dark via-cinema-dark/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 w-full">
            {/* Poster thumbnail */}
            <div className="relative aspect-[2/3] w-36 sm:w-44 shrink-0 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-slate-900">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Info details */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-400/20">
                  {movie.rating}
                </span>
                <span className="rounded bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                  {movie.language}
                </span>
                <span className="rounded bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                  {movie.durationMins} mins
                </span>
                <span className="text-xs text-amber-400 font-semibold">
                  {movie.genres?.join(" • ")}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>

              <p className="max-w-3xl text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                {movie.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Showtimes & Booking Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Date Selector Tabs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-400" />
              Select Date & Screening
            </h2>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {next7Days.map((day, idx) => {
              const isSelected = selectedDateIndex === idx;
              return (
                <button
                  key={day.isoDay}
                  onClick={() => setSelectedDateIndex(idx)}
                  className={`flex flex-col items-center justify-center min-w-[90px] rounded-2xl py-3 px-4 border transition-all ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20 scale-105"
                      : "bg-cinema-card text-slate-300 border-cinema-border hover:bg-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider opacity-80">
                    {day.dayName}
                  </span>
                  <span className="text-sm font-extrabold mt-0.5">{day.dateStr}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Cinema Showtimes Listing */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-cinema-border pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-400" />
              Available Theatres & Timings
            </h3>
            <span className="text-xs text-slate-400">
              {next7Days[selectedDateIndex]?.dayName},{" "}
              {next7Days[selectedDateIndex]?.dateStr}
            </span>
          </div>

          {cinemasWithShowtimes.length > 0 ? (
            <div className="space-y-6">
              {cinemasWithShowtimes.map((cinema) => {
                // Filter showtimes for selected date
                const dayShowtimes: Showtime[] = (cinema.showtimes || []).filter(
                  (st: Showtime) => st.startTime.startsWith(selectedDateIso)
                );

                if (dayShowtimes.length === 0) {
                  return (
                    <div
                      key={cinema.id}
                      className="rounded-2xl bg-cinema-card/50 p-5 border border-cinema-border/50 text-slate-400 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">{cinema.name}</span>
                        <span>No screenings on this date</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={cinema.id}
                    className="rounded-3xl bg-cinema-card p-6 border border-cinema-border space-y-4"
                  >
                    {/* Cinema Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">{cinema.name}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          {cinema.address}, {cinema.city}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 border border-slate-700">
                          Recliner Available
                        </span>
                        <span className="rounded bg-amber-400/10 px-2 py-0.5 text-amber-300 border border-amber-400/20">
                          Dolby Atmos
                        </span>
                      </div>
                    </div>

                    {/* Showtimes Grid */}
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                        Select Showtime to Pick Seats:
                      </span>

                      <div className="flex flex-wrap gap-3">
                        {dayShowtimes.map((st) => {
                          const timeStr = new Date(st.startTime).toLocaleTimeString(
                            "en-US",
                            { hour: "2-digit", minute: "2-digit" }
                          );
                          const priceStr = (st.basePriceCents / 100).toFixed(2);

                          return (
                            <Link
                              key={st.id}
                              href={`/booking/${st.id}`}
                              className="group flex flex-col items-center justify-center rounded-xl bg-slate-900 px-4 py-3 border border-slate-700/80 hover:border-amber-400 hover:bg-amber-400/10 transition-all hover:scale-105 shadow-sm active:scale-95"
                            >
                              <span className="text-base font-extrabold text-white group-hover:text-amber-400">
                                {timeStr}
                              </span>

                              <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                                <span className="font-semibold text-amber-400">
                                  {st.format}
                                </span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-300">${priceStr}</span>
                              </div>

                              <span className="text-[10px] text-slate-500 group-hover:text-slate-300 mt-1">
                                {st.auditorium?.name?.split(" - ")[0] || "Standard"}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-cinema-card p-8 text-center border border-cinema-border space-y-3">
              <Info className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                No active showtimes scheduled yet for this title.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Movie, Cinema, Auditorium } from "@/lib/types";
import {
  Calendar,
  Plus,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Film,
  DollarSign,
} from "lucide-react";

export default function AdminShowtimesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Scheduler Form State
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedAuditoriumId, setSelectedAuditoriumId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [basePriceCents, setBasePriceCents] = useState(1600); // $16.00 in minor units
  const [format, setFormat] = useState("2D");

  useEffect(() => {
    async function loadData() {
      try {
        const [mRes, cRes] = await fetch("/api/movies").then((r) => r.json());
        const cinRes = await fetch("/api/cinemas").then((r) => r.json());
        const moviesList = mRes?.movies || [];
        const cinemasList = cinRes?.cinemas || [];

        setMovies(moviesList);
        setCinemas(cinemasList);

        if (moviesList.length > 0) setSelectedMovieId(moviesList[0].id);
        if (cinemasList.length > 0) {
          setSelectedCinemaId(cinemasList[0].id);
          if (cinemasList[0].auditoriums?.length > 0) {
            setSelectedAuditoriumId(cinemasList[0].auditoriums[0].id);
          }
        }

        // Set default start time to today at 19:30
        const defaultTime = new Date();
        defaultTime.setHours(19, 30, 0, 0);
        setStartTime(defaultTime.toISOString().slice(0, 16));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update auditoriums when cinema changes
  const activeCinema = cinemas.find((c) => c.id === selectedCinemaId);
  const availableAuditoriums = activeCinema?.auditoriums || [];

  const handleCinemaChange = (cId: string) => {
    setSelectedCinemaId(cId);
    const cin = cinemas.find((c) => c.id === cId);
    if (cin && cin.auditoriums?.length > 0) {
      setSelectedAuditoriumId(cin.auditoriums[0].id);
    } else {
      setSelectedAuditoriumId("");
    }
  };

  const handleScheduleShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/showtimes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: selectedMovieId,
          auditoriumId: selectedAuditoriumId,
          startTime: new Date(startTime).toISOString(),
          basePriceCents: Number(basePriceCents),
          format,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule showtime");

      setSuccessMsg("Showtime scheduled! Auditorium seats have been automatically synchronized.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to schedule screening");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center space-y-4">
        <Loader2 className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading screening venues & cinema engines...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-cinema-border pb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors mb-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Admin Suite
        </Link>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Calendar className="h-8 w-8 text-amber-400" />
          Showtime Scheduling Engine
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Assign movie screenings to specific auditorium screens, select formats, and configure base prices
        </p>
      </div>

      {successMsg && (
        <div className="rounded-2xl bg-emerald-950/60 p-4 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl bg-rose-950/60 p-4 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Scheduler Form Card */}
      <form
        onSubmit={handleScheduleShowtime}
        className="rounded-3xl bg-cinema-card p-6 sm:p-8 border border-cinema-border space-y-6 shadow-2xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Select Movie */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Feature Movie
            </label>
            <select
              value={selectedMovieId}
              onChange={(e) => setSelectedMovieId(e.target.value)}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
            >
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.rating} • {m.durationMins}m)
                </option>
              ))}
            </select>
          </div>

          {/* Screening Format */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Screening Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
            >
              <option value="2D">2D Standard Digital</option>
              <option value="3D">RealD 3D</option>
              <option value="IMAX">IMAX with Laser</option>
              <option value="4DX">4DX Motion & Effects</option>
            </select>
          </div>

          {/* Select Cinema */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cinema Venue
            </label>
            <select
              value={selectedCinemaId}
              onChange={(e) => handleCinemaChange(e.target.value)}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
            >
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
          </div>

          {/* Select Auditorium */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Screen Auditorium
            </label>
            <select
              value={selectedAuditoriumId}
              onChange={(e) => setSelectedAuditoriumId(e.target.value)}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
            >
              {availableAuditoriums.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.seatingCapacity} seats • {a.screenType})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Screening Start Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Base Price in Cents */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Base Ticket Price (in Minor Units / Cents)
            </label>
            <div className="relative">
              <input
                type="number"
                required
                step={50}
                value={basePriceCents}
                onChange={(e) => setBasePriceCents(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-900 pl-8 pr-4 py-3 text-xs text-white font-mono border border-slate-700 focus:border-amber-400 focus:outline-none"
              />
              <span className="absolute left-3 top-3 text-xs text-slate-500 font-bold">$</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Formatted: ${(basePriceCents / 100).toFixed(2)} USD
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Initializing Screen Inventory...
              </>
            ) : (
              "Schedule Screening & Generate Seat Inventory"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

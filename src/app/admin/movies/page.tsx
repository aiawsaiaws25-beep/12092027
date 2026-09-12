"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Movie } from "@/lib/types";
import {
  Film,
  Plus,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Star,
} from "lucide-react";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Movie Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [backdropUrl, setBackdropUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [durationMins, setDurationMins] = useState(120);
  const [rating, setRating] = useState("PG-13");
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [language, setLanguage] = useState("English");
  const [status, setStatus] = useState("NOW_SHOWING");
  const [genres, setGenres] = useState("Action, Sci-Fi, Thriller");

  const loadMovies = async () => {
    try {
      const res = await fetch("/api/movies");
      const data = await res.json();
      setMovies(data.movies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          posterUrl,
          backdropUrl,
          trailerUrl,
          durationMins: Number(durationMins),
          rating,
          releaseDate,
          language,
          status,
          genres: genres.split(",").map((g) => g.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add movie");

      setSuccessMsg(`Successfully added "${title}" to the active cinema catalogue!`);
      // Reset form
      setTitle("");
      setDescription("");
      setPosterUrl("");
      setBackdropUrl("");
      setTrailerUrl("");
      loadMovies();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add movie");
    } finally {
      setSubmitting(false);
    }
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
            <Film className="h-8 w-8 text-amber-400" />
            Movie Catalogue Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add new theatrical releases, configure synopsis, poster assets, and age ratings
          </p>
        </div>
      </div>

      {/* Main Grid: Form on Left, Current Movies on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Form: Add Movie */}
        <div className="rounded-3xl bg-cinema-card p-6 border border-cinema-border space-y-5 shadow-xl">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-amber-400" />
            Add New Feature Title
          </h3>

          {successMsg && (
            <div className="rounded-xl bg-emerald-950/60 p-3 text-xs text-emerald-300 border border-emerald-500/40 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl bg-rose-950/60 p-3 text-xs text-rose-300 border border-rose-500/40 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateMovie} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Movie Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Avatar 3: Fire and Ash"
                className="w-full rounded-xl bg-slate-900 px-3.5 py-2.5 text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Synopsis</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed plot synopsis..."
                className="w-full rounded-xl bg-slate-900 px-3.5 py-2.5 text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  required
                  value={durationMins}
                  onChange={(e) => setDurationMins(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-900 px-3.5 py-2.5 text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Age Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 px-3.5 py-2.5 text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
                >
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                  <option value="NC-17">NC-17</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Poster Image URL</label>
              <input
                type="url"
                required
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-xl bg-slate-900 px-3.5 py-2.5 text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Backdrop Image URL (Optional)</label>
              <input
                type="url"
                value={backdropUrl}
                onChange={(e) => setBackdropUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-xl bg-slate-900 px-3.5 py-2.5 text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Genres (comma-separated)</label>
              <input
                type="text"
                required
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                placeholder="Action, Sci-Fi, Adventure"
                className="w-full rounded-xl bg-slate-900 px-3.5 py-2.5 text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 px-3.5 py-2.5 text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
                >
                  <option value="NOW_SHOWING">NOW SHOWING</option>
                  <option value="COMING_SOON">COMING SOON</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Language</label>
                <input
                  type="text"
                  required
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 px-3.5 py-2.5 text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-slate-950 shadow hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
              >
                {submitting ? "Saving to Database..." : "Save Movie to Catalogue"}
              </button>
            </div>
          </form>
        </div>

        {/* Right 2 Cols: Existing Catalogue */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Active Titles in Database ({movies.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {movies.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-cinema-card p-4 border border-cinema-border flex gap-4 items-start shadow-md"
              >
                <div className="relative w-20 aspect-[2/3] shrink-0 rounded-lg overflow-hidden bg-slate-900">
                  <img src={m.posterUrl} alt={m.title} className="object-cover w-full h-full" />
                </div>

                <div className="space-y-1.5 flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                      {m.rating}
                    </span>
                    <span className="text-[10px] text-slate-400">{m.status}</span>
                  </div>

                  <h4 className="font-bold text-white text-sm line-clamp-1">{m.title}</h4>
                  <p className="text-slate-400 text-[11px] line-clamp-2">{m.description}</p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                    <span>{m.durationMins}m</span>
                    <span>•</span>
                    <span>{m.language}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

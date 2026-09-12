"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MovieCard } from "@/components/MovieCard";
import { Movie, Cinema } from "@/lib/types";
import { Search, Filter, Film, Sparkles, X, Loader2 } from "lucide-react";

function MoviesCatalogContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "ALL";

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/movies");
        const data = await res.json();
        setMovies(data.movies || []);
        setGenres(data.genres || []);
        setCinemas(data.cinemas || []);
      } catch (err) {
        console.error("Error loading movies:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const languages = useMemo(() => {
    const langs = new Set(movies.map((m) => m.language));
    return Array.from(langs);
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      if (
        search.trim() &&
        !m.title.toLowerCase().includes(search.toLowerCase()) &&
        !m.description.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      if (selectedStatus !== "ALL" && m.status !== selectedStatus) {
        return false;
      }

      if (selectedGenre !== "ALL") {
        const hasGenre = m.genres?.some(
          (g) => g.toLowerCase() === selectedGenre.toLowerCase()
        );
        if (!hasGenre) return false;
      }

      if (selectedLanguage !== "ALL" && m.language !== selectedLanguage) {
        return false;
      }

      return true;
    });
  }, [movies, search, selectedGenre, selectedLanguage, selectedStatus]);

  const clearFilters = () => {
    setSearch("");
    setSelectedGenre("ALL");
    setSelectedLanguage("ALL");
    setSelectedStatus("ALL");
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cinema-border pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Film className="h-8 w-8 text-amber-400" />
            Movie Catalogue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover premier releases, IMAX screenings, and coming attractions
          </p>
        </div>

        {/* Status Toggle Pills */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setSelectedStatus("ALL")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              selectedStatus === "ALL"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Titles
          </button>
          <button
            onClick={() => setSelectedStatus("NOW_SHOWING")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              selectedStatus === "NOW_SHOWING"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => setSelectedStatus("COMING_SOON")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              selectedStatus === "COMING_SOON"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-2xl bg-cinema-card p-5 border border-cinema-border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Title Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search movie title, synopsis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 border border-slate-700/80 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Genre Filter */}
          <div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs text-slate-200 border border-slate-700/80 focus:border-amber-400 focus:outline-none"
            >
              <option value="ALL">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs text-slate-200 border border-slate-700/80 focus:border-amber-400 focus:outline-none"
            >
              <option value="ALL">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 border border-slate-700 hover:bg-slate-750 hover:text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Quick Genre Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Quick Filter:
          </span>
          {genres.map((g) => {
            const isSelected = selectedGenre.toLowerCase() === g.name.toLowerCase();
            return (
              <button
                key={g.id}
                onClick={() =>
                  setSelectedGenre(isSelected ? "ALL" : g.name)
                }
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                    : "bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-amber-400/40"
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Film className="h-10 w-10 text-amber-400 animate-pulse mx-auto" />
          <p className="text-sm text-slate-400">Loading cinema catalogue...</p>
        </div>
      ) : filteredMovies.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
            <span>Showing {filteredMovies.length} movie(s)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-cinema-card p-12 text-center border border-cinema-border space-y-4">
          <Film className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            We couldn't find any movie matching your active filters. Try adjusting your search query or reset filters.
          </p>
          <button
            onClick={clearFilters}
            className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 shadow"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function MoviesCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-24 text-center space-y-3">
          <Loader2 className="h-10 w-10 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading catalogue...</p>
        </div>
      }
    >
      <MoviesCatalogContent />
    </Suspense>
  );
}

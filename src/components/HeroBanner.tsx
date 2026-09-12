"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Ticket, Clock, Star, Sparkles, X, ShieldCheck } from "lucide-react";
import { Movie } from "@/lib/types";

export function HeroBanner({ featuredMovie }: { featuredMovie: Movie }) {
  const [showTrailer, setShowTrailer] = useState(false);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-950 border border-cinema-border/80 shadow-2xl">
      {/* Background Backdrop */}
      <div className="absolute inset-0">
        {featuredMovie.backdropUrl && (
          <Image
            src={featuredMovie.backdropUrl}
            alt={featuredMovie.title}
            fill
            priority
            className="object-cover object-center opacity-40 filter brightness-75 scale-105 animate-fade-in"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-cinema-dark/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-dark via-cinema-dark/80 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-12 flex flex-col md:flex-row items-center gap-10">
        {/* Left Col Info */}
        <div className="flex-1 space-y-6 text-left">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30 shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Featured Premiere
            </span>
            <span className="rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-white border border-slate-700">
              IMAX 3D & 4DX
            </span>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-400/20">
              {featuredMovie.rating}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {featuredMovie.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="h-4 w-4 text-amber-400" />
              {featuredMovie.durationMins} minutes
            </span>
            <span>•</span>
            <span className="text-slate-300 font-medium">{featuredMovie.language}</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{featuredMovie.genres?.join(", ")}</span>
          </div>

          <p className="max-w-2xl text-sm sm:text-base text-slate-300/90 leading-relaxed line-clamp-3">
            {featuredMovie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href={`/movies/${featuredMovie.slug}`}
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Ticket className="h-4 w-4" />
              Book Tickets Now
            </Link>

            <button
              onClick={() => setShowTrailer(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900/80 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-white border border-slate-700/80 hover:bg-slate-800 hover:border-amber-400/40 transition-all"
            >
              <Play className="h-4 w-4 text-amber-400 fill-current" />
              Watch Trailer
            </button>
          </div>
        </div>

        {/* Right Col Poster Preview */}
        <div className="hidden md:block w-72 shrink-0">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10 group">
            <Image
              src={featuredMovie.posterUrl}
              alt={featuredMovie.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-[11px] font-semibold text-amber-400 tracking-wide uppercase">
                Now in Theatres
              </span>
              <p className="text-sm font-bold text-white truncate">{featuredMovie.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 z-10 rounded-full bg-slate-900/80 p-2 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <Play className="h-16 w-16 text-amber-400 animate-pulse" />
              <h3 className="text-xl font-bold text-white">Trailer: {featuredMovie.title}</h3>
              <p className="text-sm text-slate-400 max-w-md">
                Official high-definition preview stream. Ready to witness this on the big screen?
              </p>
              <Link
                href={`/movies/${featuredMovie.slug}`}
                onClick={() => setShowTrailer(false)}
                className="mt-4 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950"
              >
                Select Showtime & Seats
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

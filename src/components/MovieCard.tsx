import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Star, Film, Ticket } from "lucide-react";
import { Movie } from "@/lib/types";

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-cinema-card border border-cinema-border transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/10">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-400/30">
          {movie.rating}
        </div>

        {/* Status Badge */}
        {movie.status === "COMING_SOON" ? (
          <div className="absolute top-3 left-3 rounded-md bg-sky-500/90 backdrop-blur-md px-2 py-0.5 text-[11px] font-bold text-white shadow">
            COMING SOON
          </div>
        ) : (
          <div className="absolute top-3 left-3 rounded-md bg-amber-500/90 backdrop-blur-md px-2 py-0.5 text-[11px] font-bold text-slate-950 shadow">
            NOW SHOWING
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {movie.genres?.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700/50"
              >
                {genre}
              </span>
            ))}
          </div>

          <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
            {movie.title}
          </h3>

          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              {movie.durationMins}m
            </span>
            <span>•</span>
            <span>{movie.language}</span>
          </div>

          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {movie.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <Link
            href={`/movies/${movie.slug}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-[0.98]"
          >
            <Ticket className="h-4 w-4" />
            {movie.status === "COMING_SOON" ? "View Details" : "Book Tickets"}
          </Link>
        </div>
      </div>
    </div>
  );
}

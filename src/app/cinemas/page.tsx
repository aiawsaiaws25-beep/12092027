import React from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { Building2, MapPin, Phone, Film, Sparkles, Volume2, Monitor } from "lucide-react";

export const revalidate = 0;

export default async function CinemasPage() {
  await store.init();
  const cinemas = Array.from(store.cinemas.values()).map((c) => {
    const auditoriums = Array.from(store.auditoriums.values()).filter(
      (a) => a.cinemaId === c.id
    );
    return {
      ...c,
      auditoriums,
    };
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-cinema-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <Building2 className="h-8 w-8 text-amber-400" />
          Cinema Theatres & Screens
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore world-class cinematic venues equipped with IMAX Laser, Dolby Atmos, and luxury seating
        </p>
      </div>

      {/* Cinema Cards */}
      <div className="grid grid-cols-1 gap-8">
        {cinemas.map((cinema) => (
          <div
            key={cinema.id}
            className="rounded-3xl bg-cinema-card p-6 sm:p-8 border border-cinema-border space-y-6 shadow-xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                    Flagship Venue
                  </span>
                  <span className="text-xs text-slate-400">{cinema.city}, {cinema.state}</span>
                </div>
                <h2 className="text-2xl font-black text-white">{cinema.name}</h2>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                  {cinema.address}, {cinema.city}, {cinema.state} {cinema.postalCode}
                </p>
              </div>

              {cinema.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 self-start md:self-auto">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{cinema.phone}</span>
                </div>
              )}
            </div>

            {/* Auditoriums inside Cinema */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Auditoriums & Screen Specs:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cinema.auditoriums.map((aud) => (
                  <div
                    key={aud.id}
                    className="rounded-2xl bg-slate-900/90 p-4 border border-slate-800 space-y-2 hover:border-amber-400/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{aud.name}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          aud.screenType === "IMAX"
                            ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                            : aud.screenType === "VIP"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {aud.screenType}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400">
                      <p className="flex items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5 text-slate-500" />
                        Seating Capacity: <span className="font-semibold text-slate-200">{aud.seatingCapacity} seats</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Volume2 className="h-3.5 w-3.5 text-slate-500" />
                        Audio: <span className="font-semibold text-slate-200">{aud.soundSystem}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/movies"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                <Film className="h-4 w-4" />
                Browse Screenings at {cinema.name.split(" ")[0]}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

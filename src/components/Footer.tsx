import React from "react";
import Link from "next/link";
import { Film, ShieldCheck, Zap, Database, CreditCard, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-cinema-border bg-slate-950/80 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold">
                <Film className="h-5 w-5 fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Cine<span className="text-amber-400">Book</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Next-generation cinema ticket reservation platform. Real-time seat concurrency protection, zero double-booking tolerance, and instant digital ticketing.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Neon Engine Active
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Explore</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/movies" className="hover:text-amber-400 transition-colors">
                  Now Showing Movies
                </Link>
              </li>
              <li>
                <Link href="/movies?status=COMING_SOON" className="hover:text-amber-400 transition-colors">
                  Coming Soon Releases
                </Link>
              </li>
              <li>
                <Link href="/cinemas" className="hover:text-amber-400 transition-colors">
                  Participating Cinemas
                </Link>
              </li>
              <li>
                <Link href="/account/bookings" className="hover:text-amber-400 transition-colors">
                  My Tickets & Passes
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Architecture</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-slate-300">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Next.js App Router + Tailwind
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Database className="h-3.5 w-3.5 text-sky-400" />
                Neon Serverless PostgreSQL
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Drizzle ORM & Row Locking
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CreditCard className="h-3.5 w-3.5 text-purple-400" />
                Minor-Unit Minor Currency System
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Staff & Admin</h3>
            <p className="text-xs text-slate-400">
              Authorized personnel can access showtime scheduling, live occupancy metrics, and seat hold management.
            </p>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-amber-400 border border-slate-800 hover:border-amber-400/40 transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                Open Admin Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CineBook Inc. Production-ready cinema booking engine.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-2">
            <span>Serverless Transaction Engine</span>
            <span>•</span>
            <span className="text-amber-400/80">Zero Double-Booking Guarantee</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

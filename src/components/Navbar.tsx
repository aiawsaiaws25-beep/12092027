"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Film,
  Compass,
  Building2,
  Ticket,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
    role: string;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const quickLoginAs = async (email: string, pass: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });
    if (res.ok) {
      fetchUser();
      router.refresh();
    }
  };

  const navLinks = [
    { name: "Movies", href: "/movies", icon: Film },
    { name: "Cinemas", href: "/cinemas", icon: Building2 },
    { name: "My Bookings", href: "/account/bookings", icon: Ticket },
    ...(currentUser?.role === "ADMIN"
      ? [{ name: "Admin Suite", href: "/admin", icon: ShieldCheck }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cinema-border/80 bg-cinema-dark/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Film className="h-5 w-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Cine<span className="text-amber-400">Book</span>
                <span className="rounded-full bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-400/20">
                  PRO
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-amber-400/10 text-amber-400 border border-amber-400/20 shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Search & Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search movies, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 rounded-full bg-slate-900/90 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 border border-slate-700/60 focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all focus:w-64"
            />
            <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
          </form>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 px-3 py-1.5 border border-slate-800">
                <div className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-xs font-bold">
                  {currentUser.name[0]}
                </div>
                <div className="flex flex-col text-left text-xs">
                  <span className="font-semibold text-slate-200">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400">{currentUser.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Quick Demo Login Pill */}
              <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
                <button
                  onClick={() => quickLoginAs("customer@cinebook.com", "customer123")}
                  className="rounded px-2 py-1 text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                >
                  Demo User
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => quickLoginAs("admin@cinebook.com", "admin123")}
                  className="rounded px-2 py-1 text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                >
                  Demo Admin
                </button>
              </div>

              <Link
                href="/auth/login"
                className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cinema-border bg-cinema-card px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="text"
              placeholder="Search movies, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-slate-900 pl-9 pr-4 py-2 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:border-amber-400"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </form>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  <Icon className="h-4 w-4 text-amber-400" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-rose-400 font-medium py-1 px-2.5 rounded bg-rose-500/10 border border-rose-500/20"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-lg bg-amber-500 py-2 text-sm font-semibold text-slate-950 shadow"
                >
                  Sign In / Register
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      quickLoginAs("customer@cinebook.com", "customer123");
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 rounded bg-slate-800 py-1.5 text-xs text-slate-300 border border-slate-700"
                  >
                    Quick User
                  </button>
                  <button
                    onClick={() => {
                      quickLoginAs("admin@cinebook.com", "admin123");
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 rounded bg-slate-800 py-1.5 text-xs text-slate-300 border border-slate-700"
                  >
                    Quick Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

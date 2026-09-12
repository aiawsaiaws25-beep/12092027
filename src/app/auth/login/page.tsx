"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, Lock, Mail, AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed. Check your credentials.");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = (userType: "CUSTOMER" | "ADMIN") => {
    if (userType === "ADMIN") {
      setEmail("admin@cinebook.com");
      setPassword("admin123");
    } else {
      setEmail("customer@cinebook.com");
      setPassword("customer123");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Film className="h-6 w-6 fill-current" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Welcome to Cine<span className="text-amber-400">Book</span>
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to manage your tickets, reserved seats, and account
          </p>
        </div>

        {/* Demo Quick Fill Helper */}
        <div className="rounded-2xl bg-slate-900/90 p-4 border border-amber-500/30 space-y-2 text-xs">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            1-Click Demo Credentials:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoUser("CUSTOMER")}
              className="rounded-lg bg-slate-800 p-2 text-left hover:bg-slate-750 border border-slate-700 hover:border-amber-400/40 transition-all"
            >
              <span className="font-bold text-slate-200 block">Alex Johnson</span>
              <span className="text-[10px] text-slate-400">customer@cinebook.com</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoUser("ADMIN")}
              className="rounded-lg bg-slate-800 p-2 text-left hover:bg-slate-750 border border-slate-700 hover:border-amber-400/40 transition-all"
            >
              <span className="font-bold text-amber-300 block">Admin Director</span>
              <span className="text-[10px] text-slate-400">admin@cinebook.com</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="rounded-3xl bg-cinema-card p-6 sm:p-8 border border-cinema-border space-y-4 shadow-2xl"
        >
          {error && (
            <div className="rounded-xl bg-rose-950/60 p-3 text-xs text-rose-300 border border-rose-500/40 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-white border border-slate-700/80 focus:border-amber-400 focus:outline-none"
              />
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-white border border-slate-700/80 focus:border-amber-400 focus:outline-none"
              />
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <div className="text-center pt-2 text-xs text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="font-bold text-amber-400 hover:underline"
            >
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

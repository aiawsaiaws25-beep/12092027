"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Booking, Ticket } from "@/lib/types";
import {
  Film,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface TicketPassProps {
  booking: Booking;
  tickets: Ticket[];
}

export function TicketPass({ booking, tickets }: TicketPassProps) {
  const [qrCodeUrls, setQrCodeUrls] = useState<{ [ticketId: string]: string }>({});
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function generateQRCodes() {
      const urls: { [ticketId: string]: string } = {};
      for (const t of tickets) {
        try {
          const url = await QRCode.toDataURL(t.qrCodeData, {
            width: 200,
            margin: 1,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });
          urls[t.id] = url;
        } catch (err) {
          console.error("QR Code error:", err);
        }
      }
      setQrCodeUrls(urls);
    }

    if (tickets.length > 0) {
      generateQRCodes();
    }
  }, [tickets]);

  const handlePrint = () => {
    window.print();
  };

  const showtimeDate = booking.showtime
    ? new Date(booking.showtime.startTime).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const showtimeTime = booking.showtime
    ? new Date(booking.showtime.startTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const movie = booking.showtime?.movie;
  const auditorium = booking.showtime?.auditorium;
  const cinema = auditorium?.cinema;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-cinema-card p-4 border border-cinema-border">
        <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold">
          <CheckCircle2 className="h-5 w-5" />
          <span>Verified Admission Pass • {booking.bookingReference}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <Printer className="h-4 w-4 text-amber-400" />
            Print Tickets
          </button>
        </div>
      </div>

      {/* Ticket Pass Container */}
      <div ref={ticketRef} className="space-y-6">
        {tickets.map((ticket, index) => (
          <div
            key={ticket.id}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-cinema-card to-slate-950 border border-amber-500/30 shadow-2xl shadow-black/60"
          >
            {/* Top Amber Accent Line */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-dashed divide-slate-700/80">
              {/* Left Main Information */}
              <div className="flex-1 p-6 sm:p-8 space-y-6">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
                      <Film className="h-4 w-4" />
                    </div>
                    <span className="font-extrabold text-white text-base tracking-tight">
                      Cine<span className="text-amber-400">Book</span> Pass
                    </span>
                  </div>
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/20">
                    Seat {ticket.seatLabel} ({index + 1} of {tickets.length})
                  </span>
                </div>

                {/* Movie Title */}
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Feature Presentation
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {movie?.title || "Cinema Movie"}
                  </h2>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                    <span>{movie?.rating || "PG-13"}</span>
                    <span>•</span>
                    <span>{movie?.durationMins || 120} mins</span>
                    <span>•</span>
                    <span className="font-semibold text-amber-400">
                      {booking.showtime?.format || "IMAX"}
                    </span>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Date
                    </span>
                    <p className="text-sm font-bold text-white mt-0.5">{showtimeDate}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Showtime
                    </span>
                    <p className="text-sm font-bold text-amber-400 mt-0.5">{showtimeTime}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Auditorium
                    </span>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {auditorium?.name || "Screen 1"}
                    </p>
                  </div>
                </div>

                {/* Cinema Location */}
                <div className="flex items-start gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-200">{cinema?.name}</p>
                    <p>{cinema?.address}, {cinema?.city}</p>
                  </div>
                </div>
              </div>

              {/* Right Stub & Scannable QR Code */}
              <div className="w-full md:w-64 p-6 sm:p-8 flex flex-col items-center justify-between text-center bg-black/40">
                <div className="space-y-1 w-full">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Scan for Admission
                  </span>
                  <p className="text-xs font-mono font-bold text-amber-400">{ticket.ticketCode}</p>
                </div>

                {/* QR Code Container */}
                <div className="my-4 p-3 bg-white rounded-2xl shadow-lg">
                  {qrCodeUrls[ticket.id] ? (
                    <img
                      src={qrCodeUrls[ticket.id]}
                      alt={`Ticket QR for ${ticket.ticketCode}`}
                      className="w-36 h-36"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center bg-slate-100 text-slate-400">
                      <QrCode className="h-12 w-12 animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="w-full space-y-1 text-center">
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    Ref: {booking.bookingReference}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <ShieldCheck className="h-3 w-3" />
                    Digital Signature Verified
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-slate-950 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80">
              <span>Present this pass on your device or in print at the auditorium entrance</span>
              <span className="font-semibold text-slate-400">Tear Line & Entry Scan</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

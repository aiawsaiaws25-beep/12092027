"use client";

import React, { useState, useMemo } from "react";
import { SeatType, SeatStatus } from "@/lib/types";
import { Info, Check, ShieldAlert, Sparkles, Armchair, Accessibility } from "lucide-react";

export interface SeatMapItem {
  id: string;
  showtimeSeatId: string;
  rowLabel: string;
  seatNumber: number;
  seatType: SeatType;
  status: SeatStatus;
  heldUntil?: string | null;
}

interface SeatMapProps {
  seats: SeatMapItem[];
  basePriceCents: number;
  selectedSeatIds: string[];
  onToggleSeat: (seat: SeatMapItem) => void;
  maxSeats?: number;
}

export function SeatMap({
  seats,
  basePriceCents,
  selectedSeatIds,
  onToggleSeat,
  maxSeats = 10,
}: SeatMapProps) {
  const [hoveredSeat, setHoveredSeat] = useState<SeatMapItem | null>(null);

  // Group seats by row
  const rows = useMemo(() => {
    const rowMap = new Map<string, SeatMapItem[]>();
    for (const seat of seats) {
      if (!rowMap.has(seat.rowLabel)) {
        rowMap.set(seat.rowLabel, []);
      }
      rowMap.get(seat.rowLabel)!.push(seat);
    }

    // Sort rows alphabetically and seats numerically
    return Array.from(rowMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([rowLabel, rowSeats]) => ({
        rowLabel,
        seats: rowSeats.sort((a, b) => a.seatNumber - b.seatNumber),
      }));
  }, [seats]);

  const getSeatPrice = (seatType: SeatType) => {
    let price = basePriceCents;
    if (seatType === "VIP") price += 500;
    if (seatType === "RECLINER") price += 800;
    return (price / 100).toFixed(2);
  };

  const getSeatStyle = (seat: SeatMapItem) => {
    const isSelected = selectedSeatIds.includes(seat.id);

    if (isSelected) {
      return "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/50 scale-110 ring-2 ring-amber-300 font-bold z-10";
    }

    if (seat.status === "BOOKED") {
      return "bg-slate-800/60 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50";
    }

    if (seat.status === "HELD") {
      return "bg-orange-500/30 text-orange-400 border border-orange-500/50 cursor-not-allowed animate-pulse";
    }

    if (seat.status === "BLOCKED") {
      return "bg-rose-950/40 text-rose-600 border border-rose-900 cursor-not-allowed opacity-40";
    }

    // AVAILABLE: styling by tier
    if (seat.seatType === "RECLINER") {
      return "bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950 hover:scale-110 shadow-sm";
    }
    if (seat.seatType === "VIP") {
      return "bg-purple-950/60 text-purple-300 border border-purple-500/40 hover:bg-purple-500 hover:text-slate-950 hover:scale-110 shadow-sm";
    }
    if (seat.seatType === "ACCESSIBLE") {
      return "bg-blue-950/60 text-blue-300 border border-blue-500/40 hover:bg-blue-500 hover:text-slate-950 hover:scale-110 shadow-sm";
    }

    return "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-amber-400 hover:text-slate-950 hover:border-amber-400 hover:scale-110 hover:shadow-md";
  };

  return (
    <div className="flex flex-col items-center w-full py-4 select-none">
      {/* Curved Screen */}
      <div className="w-full max-w-2xl flex flex-col items-center mb-10">
        <div className="relative w-full h-10 flex items-center justify-center">
          <div className="w-4/5 h-2.5 rounded-t-full bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20 screen-glow" />
        </div>
        <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-slate-500">
          Curved Cinema Screen
        </span>
      </div>

      {/* Seat Grid Layout */}
      <div className="w-full overflow-x-auto pb-6 flex justify-center">
        <div className="flex flex-col gap-3 min-w-max px-4">
          {rows.map(({ rowLabel, seats: rowSeats }) => (
            <div key={rowLabel} className="flex items-center gap-2">
              {/* Row Label Left */}
              <div className="w-6 text-center text-xs font-bold text-slate-500">
                {rowLabel}
              </div>

              {/* Seats in Row */}
              <div className="flex items-center gap-2">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeatIds.includes(seat.id);
                  const isAvailable = seat.status === "AVAILABLE";

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={!isAvailable && !isSelected}
                      onClick={() => onToggleSeat(seat)}
                      onMouseEnter={() => setHoveredSeat(seat)}
                      onMouseLeave={() => setHoveredSeat(null)}
                      title={`Seat ${seat.rowLabel}${seat.seatNumber} (${seat.seatType}) - $${getSeatPrice(seat.seatType)}`}
                      className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-xs transition-all duration-150 ${getSeatStyle(
                        seat
                      )}`}
                    >
                      {isSelected ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : seat.seatType === "ACCESSIBLE" ? (
                        <Accessibility className="h-3.5 w-3.5" />
                      ) : (
                        <span className="font-semibold">{seat.seatNumber}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Row Label Right */}
              <div className="w-6 text-center text-xs font-bold text-slate-500">
                {rowLabel}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hovered Seat Inspector Tag */}
      <div className="h-7 my-2 flex items-center justify-center">
        {hoveredSeat ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-1 text-xs text-slate-200 border border-slate-700 shadow-lg">
            <span className="font-bold text-amber-400">
              Row {hoveredSeat.rowLabel}, Seat {hoveredSeat.seatNumber}
            </span>
            <span>•</span>
            <span className="text-slate-300 capitalize">{hoveredSeat.seatType.toLowerCase()}</span>
            <span>•</span>
            <span className="font-semibold text-emerald-400">
              ${getSeatPrice(hoveredSeat.seatType)}
            </span>
            <span>•</span>
            <span
              className={`text-[10px] font-bold uppercase ${
                hoveredSeat.status === "AVAILABLE"
                  ? "text-emerald-400"
                  : hoveredSeat.status === "HELD"
                  ? "text-orange-400"
                  : "text-slate-500"
              }`}
            >
              {hoveredSeat.status}
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Click on available seats to select (Max {maxSeats} seats)
          </p>
        )}
      </div>

      {/* Seat Map Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 rounded-2xl bg-cinema-card/80 p-4 border border-cinema-border text-xs">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-slate-800 border border-slate-700" />
          <span className="text-slate-300">Available (${(basePriceCents / 100).toFixed(2)})</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px]">
            ✓
          </div>
          <span className="text-amber-400 font-medium">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-purple-950/60 border border-purple-500/40" />
          <span className="text-purple-300">VIP (+ $5.00)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-cyan-950/60 border border-cyan-500/40" />
          <span className="text-cyan-300">Recliner (+ $8.00)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-orange-500/30 border border-orange-500/50" />
          <span className="text-orange-400">Held (Temp Lock)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-slate-800/60 border border-slate-800 opacity-50" />
          <span className="text-slate-500">Booked</span>
        </div>
      </div>
    </div>
  );
}

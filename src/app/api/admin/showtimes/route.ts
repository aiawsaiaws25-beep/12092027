import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { Showtime } from "@/lib/types";

export async function POST(request: Request) {
  try {
    await store.init();
    const body = await request.json();
    const { movieId, auditoriumId, startTime, endTime, basePriceCents, format } = body;

    if (!movieId || !auditoriumId || !startTime || !basePriceCents) {
      return NextResponse.json(
        { error: "Movie, auditorium, start time, and base price are required" },
        { status: 400 }
      );
    }

    const showtimeId = `st-${Date.now()}`;
    const newShowtime: Showtime = {
      id: showtimeId,
      movieId,
      auditoriumId,
      startTime: new Date(startTime).toISOString(),
      endTime: endTime
        ? new Date(endTime).toISOString()
        : new Date(new Date(startTime).getTime() + 120 * 60 * 1000).toISOString(),
      basePriceCents: Number(basePriceCents),
      format: format || "2D",
      status: "SCHEDULED",
    };

    store.showtimes.set(showtimeId, newShowtime);

    // Initialize showtime seats
    const audSeats = Array.from(store.seats.values()).filter(
      (s) => s.auditoriumId === auditoriumId
    );

    for (const s of audSeats) {
      const showtimeSeatId = `sts-${showtimeId}-${s.id}`;
      store.showtimeSeats.set(showtimeSeatId, {
        id: showtimeSeatId,
        showtimeId,
        seatId: s.id,
        status: "AVAILABLE",
        heldUntil: null,
        heldBySessionId: null,
        version: 1,
      });
    }

    return NextResponse.json(
      { showtime: store.getShowtimeWithRelations(showtimeId) },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error scheduling showtime:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create showtime" },
      { status: 500 }
    );
  }
}

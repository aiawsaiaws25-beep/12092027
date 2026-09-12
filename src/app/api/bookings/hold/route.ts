import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { showtimeId, seatIds, sessionId } = body;

    if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { error: "Showtime and at least one seat selection are required" },
        { status: 400 }
      );
    }

    // Authenticated user or guest checkout session
    const currentUser = await getCurrentUser();
    let userId = currentUser?.userId;

    if (!userId) {
      // Fallback to customer user ID if not logged in
      userId = "u2222222-2222-2222-2222-222222222222";
    }

    const result = await store.holdSeats(
      showtimeId,
      seatIds,
      userId,
      sessionId || `sess-${Date.now()}`
    );

    return NextResponse.json(
      {
        success: true,
        booking: result.booking,
        breakdown: result.breakdown,
        expiresAt: result.booking.expiresAt,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error holding seats:", err);
    const status = err.statusCode || 400;
    return NextResponse.json(
      { error: err.message || "Failed to reserve seats" },
      { status }
    );
  }
}

import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, idempotencyKey, cardLast4 } = body;

    if (!bookingId || !idempotencyKey) {
      return NextResponse.json(
        { error: "Booking ID and idempotency key are required" },
        { status: 400 }
      );
    }

    const booking = store.bookings.get(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const userId = currentUser?.userId || booking.userId;

    const result = await store.confirmBooking(
      bookingId,
      userId,
      idempotencyKey,
      cardLast4 || "4242"
    );

    return NextResponse.json(
      {
        success: true,
        booking: result.booking,
        tickets: result.tickets,
        payment: result.payment,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error confirming booking:", err);
    return NextResponse.json(
      { error: err.message || "Failed to confirm payment and booking" },
      { status: 400 }
    );
  }
}

import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const booking = store.bookings.get(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const isAdmin = currentUser?.role === "ADMIN";
    const userId = currentUser?.userId || booking.userId;

    const updatedBooking = await store.cancelBooking(bookingId, userId, isAdmin);

    return NextResponse.json({
      success: true,
      message: "Booking successfully cancelled and refund initiated.",
      booking: updatedBooking,
    });
  } catch (err: any) {
    console.error("Error cancelling booking:", err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel booking" },
      { status: 400 }
    );
  }
}

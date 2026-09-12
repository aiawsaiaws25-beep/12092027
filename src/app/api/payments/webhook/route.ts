import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const event = JSON.parse(rawBody);

    const idempotencyKey =
      request.headers.get("x-idempotency-key") ||
      event.idempotency_key ||
      event.id ||
      `evt-${Date.now()}`;

    // Handle test webhook events (e.g. payment_intent.succeeded)
    if (event.type === "payment_intent.succeeded") {
      const { bookingId, userId } = event.data.object.metadata || {};
      if (bookingId && userId) {
        await store.confirmBooking(bookingId, userId, idempotencyKey);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const { bookingId } = event.data.object.metadata || {};
      if (bookingId) {
        const payment = Array.from(store.payments.values()).find(
          (p) => p.bookingId === bookingId
        );
        if (payment) {
          payment.status = "FAILED";
        }
      }
    }

    return NextResponse.json({ received: true, eventId: event.id, idempotencyKey });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: err.message || "Webhook processing failed" },
      { status: 400 }
    );
  }
}

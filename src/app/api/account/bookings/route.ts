import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-static";

export async function GET() {
  await store.init();
  const session = await getCurrentUser();

  // If not logged in, return bookings for default customer user to showcase functionality
  const userId = session?.userId || "u2222222-2222-2222-2222-222222222222";

  const allBookings = Array.from(store.bookings.values())
    .filter((b) => b.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((b) => store.getBookingWithRelations(b.id))
    .filter(Boolean);

  return NextResponse.json({ bookings: allBookings });
}

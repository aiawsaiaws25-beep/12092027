import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(request: Request) {
  await store.init();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase();
  const status = searchParams.get("status");

  let allBookings = Array.from(store.bookings.values());

  if (status && status !== "ALL") {
    allBookings = allBookings.filter((b) => b.status === status);
  }

  let enriched = allBookings
    .map((b) => store.getBookingWithRelations(b.id))
    .filter(Boolean);

  if (search) {
    enriched = enriched.filter(
      (b) =>
        b?.bookingReference.toLowerCase().includes(search) ||
        b?.user?.name.toLowerCase().includes(search) ||
        b?.user?.email.toLowerCase().includes(search) ||
        b?.showtime?.movie?.title.toLowerCase().includes(search)
    );
  }

  enriched.sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime());

  return NextResponse.json({ bookings: enriched });
}

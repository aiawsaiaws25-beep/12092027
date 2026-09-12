import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-static";

export async function GET(request: Request) {
  await store.init();
  let search: string | undefined;
  let status: string | null = null;
  try {
    if (request && request.url) {
      const { searchParams } = new URL(request.url);
      search = searchParams.get("search")?.toLowerCase();
      status = searchParams.get("status");
    }
  } catch (e) {}

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

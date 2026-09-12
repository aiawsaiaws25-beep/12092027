import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  await store.init();
  const session = await getCurrentUser();

  // Allow admin access or demo access
  const allBookings = Array.from(store.bookings.values());
  const confirmedBookings = allBookings.filter((b) => b.status === "CONFIRMED");

  const totalGrossRevenueCents = confirmedBookings.reduce(
    (sum, b) => sum + b.totalCents,
    0
  );

  const totalTicketsSold = Array.from(store.tickets.values()).length;
  const activeShowtimesCount = Array.from(store.showtimes.values()).filter(
    (st) => st.status === "SCHEDULED"
  ).length;

  const totalAuditoriumCapacity = Array.from(store.auditoriums.values()).reduce(
    (sum, a) => sum + a.seatingCapacity,
    0
  );

  const occupancyRate =
    totalAuditoriumCapacity > 0
      ? Math.min(100, Math.round((totalTicketsSold / (totalAuditoriumCapacity * 4)) * 100))
      : 0;

  const recentBookings = allBookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((b) => store.getBookingWithRelations(b.id));

  const auditLogs = store.auditLogs.slice(-15).reverse();

  return NextResponse.json({
    metrics: {
      totalGrossRevenueCents,
      totalBookingsCount: allBookings.length,
      confirmedBookingsCount: confirmedBookings.length,
      totalTicketsSold,
      activeShowtimesCount,
      occupancyRate,
    },
    recentBookings,
    auditLogs,
  });
}

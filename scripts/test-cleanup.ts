import { store } from "../src/lib/store";

async function runCleanupTest() {
  console.log("\n=======================================================");
  console.log("  CINEBOOK QA: EXPIRED SEAT HOLD & CLEANUP TEST        ");
  console.log("=======================================================");

  await store.init();

  const showtimeId = Array.from(store.showtimes.keys())[0];
  const showtime = store.showtimes.get(showtimeId);
  if (!showtime) throw new Error("No showtime found");

  const availableSeats = Array.from(store.seats.values()).filter(
    (s) => s.auditoriumId === showtime.auditoriumId
  );
  const testSeat = availableSeats[2];

  console.log(`\n1. Creating temporary seat hold for seat ${testSeat.rowLabel}${testSeat.seatNumber}...`);
  const holdRes = await store.holdSeats(
    showtimeId,
    [testSeat.id],
    "u2222222-2222-2222-2222-222222222222",
    "test_session"
  );
  console.log(`   Hold created: Booking ID ${holdRes.booking.id}, Status: ${holdRes.booking.status}`);

  const stSeatId = `sts-${showtimeId}-${testSeat.id}`;
  const heldSeat = store.showtimeSeats.get(stSeatId);
  console.log(`   Seat state before expiry: ${heldSeat?.status}, HeldUntil: ${heldSeat?.heldUntil}`);

  console.log("\n2. Simulating hold expiry by advancing time past expiresAt...");
  if (heldSeat) {
    heldSeat.heldUntil = new Date(Date.now() - 60000).toISOString(); // 1 minute in the past
  }
  holdRes.booking.expiresAt = new Date(Date.now() - 60000).toISOString();

  console.log("\n3. Triggering idempotent cleanup function (POST /api/cron/release-expired-holds)...");
  const cleanupResult = await store.releaseExpiredHolds();
  console.log(`   Cleanup Result: Released ${cleanupResult.releasedSeats} seat(s)`);

  const seatAfterCleanup = store.showtimeSeats.get(stSeatId);
  const bookingAfterCleanup = store.bookings.get(holdRes.booking.id);

  console.log(`   Seat state after cleanup: ${seatAfterCleanup?.status}`);
  console.log(`   Booking state after cleanup: ${bookingAfterCleanup?.status}`);

  if (seatAfterCleanup?.status === "AVAILABLE" && bookingAfterCleanup?.status === "EXPIRED") {
    console.log("\n>>> [PASSED] CLEANUP TEST: Expired seat hold automatically released and booking marked EXPIRED!\n");
  } else {
    console.error("\n>>> [FAILED] Seat was not released back to AVAILABLE!\n");
    process.exit(1);
  }
}

runCleanupTest().catch((err) => {
  console.error(err);
  process.exit(1);
});

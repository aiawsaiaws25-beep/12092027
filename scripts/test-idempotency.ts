import { store } from "../src/lib/store";

async function runIdempotencyTest() {
  console.log("\n=======================================================");
  console.log("  CINEBOOK QA: PAYMENT IDEMPOTENCY & DUPLICATE TEST    ");
  console.log("=======================================================");

  await store.init();

  const showtimeId = Array.from(store.showtimes.keys())[0];
  const showtime = store.showtimes.get(showtimeId);
  if (!showtime) throw new Error("No showtime found");

  const availableSeats = Array.from(store.seats.values()).filter(
    (s) => s.auditoriumId === showtime.auditoriumId
  );
  const testSeat = availableSeats[3];

  const userId = "u2222222-2222-2222-2222-222222222222";
  const idempotencyKey = `idemp_test_key_${Date.now()}`;

  console.log("\n1. Reserving seat for idempotency test...");
  const holdRes = await store.holdSeats(showtimeId, [testSeat.id], userId);
  const bookingId = holdRes.booking.id;

  console.log("\n2. First Payment Confirmation Request (key: " + idempotencyKey + ")...");
  const firstConfirm = await store.confirmBooking(bookingId, userId, idempotencyKey);
  console.log(`   First Attempt Status: ${firstConfirm.booking.status}, Tickets Generated: ${firstConfirm.tickets.length}`);

  console.log("\n3. Duplicate Payment Retry (Same idempotencyKey)...");
  const duplicateConfirm = await store.confirmBooking(bookingId, userId, idempotencyKey);
  console.log(`   Duplicate Attempt Status: ${duplicateConfirm.booking.status}, Tickets Count: ${duplicateConfirm.tickets.length}`);

  const totalPaymentsForBooking = Array.from(store.payments.values()).filter(
    (p) => p.bookingId === bookingId
  ).length;

  console.log(`   Total Payment Records in DB for this booking: ${totalPaymentsForBooking}`);

  if (
    firstConfirm.booking.id === duplicateConfirm.booking.id &&
    firstConfirm.tickets[0].ticketCode === duplicateConfirm.tickets[0].ticketCode &&
    totalPaymentsForBooking === 1
  ) {
    console.log("\n>>> [PASSED] IDEMPOTENCY TEST: Duplicate retries safely returned existing records without duplicate billing or tickets!\n");
  } else {
    console.error("\n>>> [FAILED] Duplicate payment produced duplicate records!\n");
    process.exit(1);
  }
}

runIdempotencyTest().catch((err) => {
  console.error(err);
  process.exit(1);
});

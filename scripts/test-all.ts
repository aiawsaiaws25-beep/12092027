import { store } from "../src/lib/store";
import { comparePassword, hashPassword, signToken, verifyToken } from "../src/lib/auth";

async function runMasterTestSuite() {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║           CINEBOOK PRODUCTION QA & TEST SUITE RUNNER            ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  let passedTests = 0;
  let totalTests = 0;

  function assertTest(name: string, condition: boolean, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${name}`);
      if (detail) console.log(`         ↳ ${detail}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${name}`);
      if (detail) console.error(`         ↳ ${detail}`);
      process.exit(1);
    }
  }

  // TEST 1: Database Store Initialization & Seed Integrity
  console.log("► TEST SUITE 1: Database Seed & Integrity Verification");
  await store.init();
  assertTest("Seed Movies Loaded", store.movies.size >= 6, `${store.movies.size} movies initialized`);
  assertTest("Seed Cinemas & Auditoriums Loaded", store.cinemas.size >= 3, `${store.cinemas.size} cinemas, ${store.auditoriums.size} auditoriums`);
  assertTest("Seats Generated", store.seats.size >= 100, `${store.seats.size} auditorium seats indexed`);
  assertTest("Showtimes Generated", store.showtimes.size >= 10, `${store.showtimes.size} showtimes scheduled`);

  // TEST 2: Authentication & Password Hashing
  console.log("\n► TEST SUITE 2: Authentication & Password Security");
  const testPass = "superSecretPassword123";
  const hashed = await hashPassword(testPass);
  const match = await comparePassword(testPass, hashed);
  const mismatch = await comparePassword("wrongPass", hashed);
  assertTest("Password Hash Verification", match && !mismatch, "Bcrypt salt and compare verified");

  const token = signToken({
    userId: "u1111111-1111-1111-1111-111111111111",
    email: "admin@cinebook.com",
    name: "Admin Director",
    role: "ADMIN",
  });
  const decoded = verifyToken(token);
  assertTest("JWT Sign and Verification", decoded?.role === "ADMIN", `JWT token decoded: ${decoded?.email}`);

  // TEST 3: Minor-Units Exact Price Calculation
  console.log("\n► TEST SUITE 3: Money Minor-Units Math & Pricing Engine");
  const sampleShowtime = Array.from(store.showtimes.values())[0];
  const sampleAudSeats = Array.from(store.seats.values()).filter(
    (s) => s.auditoriumId === sampleShowtime.auditoriumId
  );
  const selectedSeats = sampleAudSeats.slice(0, 3);
  const breakdown = store.calculatePrice(sampleShowtime, selectedSeats);
  const expectedFee = 3 * 150; // 450 cents
  const expectedTax = Math.round(breakdown.subtotalCents * 0.05);
  const expectedTotal = breakdown.subtotalCents + expectedFee + expectedTax;

  assertTest("Service Fee Calculation", breakdown.feeCents === expectedFee, `${breakdown.feeCents}¢ for 3 tickets`);
  assertTest("Tax Calculation", breakdown.taxCents === expectedTax, `${breakdown.taxCents}¢ (5% rate)`);
  assertTest("Total Calculation Minor Units", breakdown.totalCents === expectedTotal, `${breakdown.totalCents}¢ total`);

  // TEST 4: Concurrency & Zero Double-Booking
  console.log("\n► TEST SUITE 4: Concurrent Seat Booking Race Condition");
  const contestSeat = sampleAudSeats[4];
  let confWins = 0;
  let confLoses = 0;

  await Promise.all([
    store
      .holdSeats(sampleShowtime.id, [contestSeat.id], "user_alpha", "sess_A")
      .then(() => confWins++)
      .catch(() => confLoses++),
    store
      .holdSeats(sampleShowtime.id, [contestSeat.id], "user_beta", "sess_B")
      .then(() => confWins++)
      .catch(() => confLoses++),
  ]);

  assertTest(
    "Zero Double-Booking Guarantee",
    confWins === 1 && confLoses === 1,
    `Exactly 1 succeeded (${confWins}) and 1 was rejected with 409 Conflict (${confLoses})`
  );

  // TEST 5: Hold Expiry & Automatic Cleanup
  console.log("\n► TEST SUITE 5: Expired Seat Hold Release & Cron");
  const expSeat = sampleAudSeats[5];
  const expHold = await store.holdSeats(sampleShowtime.id, [expSeat.id], "user_exp");
  const expStSeat = store.showtimeSeats.get(`sts-${sampleShowtime.id}-${expSeat.id}`);
  if (expStSeat) {
    expStSeat.heldUntil = new Date(Date.now() - 5000).toISOString();
  }
  expHold.booking.expiresAt = new Date(Date.now() - 5000).toISOString();

  const releasedCount = store.releaseExpiredHoldsSync();
  const expStSeatAfter = store.showtimeSeats.get(`sts-${sampleShowtime.id}-${expSeat.id}`);

  assertTest(
    "Automatic Hold Expiry Release",
    releasedCount > 0 && expStSeatAfter?.status === "AVAILABLE",
    `Seat status successfully restored to AVAILABLE`
  );

  // TEST 6: Payment Idempotency & Ticket Issuance
  console.log("\n► TEST SUITE 6: Payment Idempotency & Digital QR Ticket Issuance");
  const paySeat = sampleAudSeats[6];
  const payHold = await store.holdSeats(sampleShowtime.id, [paySeat.id], "user_pay");
  const idempKey = `test_idemp_${Date.now()}`;

  const res1 = await store.confirmBooking(payHold.booking.id, "user_pay", idempKey);
  const res2 = await store.confirmBooking(payHold.booking.id, "user_pay", idempKey);

  assertTest("Booking Status CONFIRMED", res1.booking.status === "CONFIRMED", `Ref: ${res1.booking.bookingReference}`);
  assertTest("QR Ticket Generated", res1.tickets.length === 1 && res1.tickets[0].ticketCode.startsWith("TCK-"), `Code: ${res1.tickets[0].ticketCode}`);
  assertTest("Idempotency Prevention", res1.tickets[0].ticketCode === res2.tickets[0].ticketCode, "Duplicate request yielded same tickets safely");

  // TEST 7: Booking Cancellation & Refund
  console.log("\n► TEST SUITE 7: Booking Cancellation & Seat Recovery");
  const cancelledBooking = await store.cancelBooking(payHold.booking.id, "user_pay", true);
  const payStSeatAfter = store.showtimeSeats.get(`sts-${sampleShowtime.id}-${paySeat.id}`);

  assertTest("Booking Status CANCELLED", cancelledBooking.status === "CANCELLED", "Booking marked CANCELLED");
  assertTest("Seats Released to AVAILABLE", payStSeatAfter?.status === "AVAILABLE", "Seat released back to inventory");

  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log(`  ALL TESTS PASSED: ${passedTests}/${totalTests} CHECKS SUCCESSFUL (100%)`);
  console.log("══════════════════════════════════════════════════════════════════\n");
}

runMasterTestSuite().catch((err) => {
  console.error("Test Suite failed with error:", err);
  process.exit(1);
});

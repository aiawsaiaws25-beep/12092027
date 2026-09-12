import { store } from "../src/lib/store";

async function runConcurrencyTest() {
  console.log("\n=======================================================");
  console.log("  CINEBOOK QA: CONCURRENT DOUBLE-BOOKING RACE TEST     ");
  console.log("=======================================================\n");

  await store.init();

  const showtimeId = Array.from(store.showtimes.keys())[0];
  const showtime = store.showtimes.get(showtimeId);
  if (!showtime) throw new Error("No showtime found");

  const availableSeats = Array.from(store.seats.values()).filter(
    (s) => s.auditoriumId === showtime.auditoriumId
  );
  const targetSeat = availableSeats[0];
  console.log(`Target Showtime: ${showtimeId}`);
  console.log(`Contested Target Seat: ${targetSeat.rowLabel}${targetSeat.seatNumber} (ID: ${targetSeat.id})\n`);

  const userA = "u1111111-1111-1111-1111-111111111111";
  const userB = "u2222222-2222-2222-2222-222222222222";

  console.log("--> Launching Session A & Session B simultaneously...");

  let successCount = 0;
  let conflictCount = 0;

  const promiseA = store
    .holdSeats(showtimeId, [targetSeat.id], userA, "session_user_A")
    .then((res) => {
      console.log("  [+] Session A SUCCESS: Locked seat, Booking Ref:", res.booking.bookingReference);
      successCount++;
      return { success: true, user: "A", res };
    })
    .catch((err) => {
      console.log("  [-] Session A REJECTED:", err.message);
      if (err.statusCode === 409 || err.message.includes("no longer available")) {
        conflictCount++;
      }
      return { success: false, user: "A", error: err.message };
    });

  const promiseB = store
    .holdSeats(showtimeId, [targetSeat.id], userB, "session_user_B")
    .then((res) => {
      console.log("  [+] Session B SUCCESS: Locked seat, Booking Ref:", res.booking.bookingReference);
      successCount++;
      return { success: true, user: "B", res };
    })
    .catch((err) => {
      console.log("  [-] Session B REJECTED:", err.message);
      if (err.statusCode === 409 || err.message.includes("no longer available")) {
        conflictCount++;
      }
      return { success: false, user: "B", error: err.message };
    });

  await Promise.all([promiseA, promiseB]);

  console.log("\n-------------------------------------------------------");
  console.log(`Results: ${successCount} Succeeded, ${conflictCount} Correctly Rejected (409 Conflict)`);
  console.log("-------------------------------------------------------");

  if (successCount === 1 && conflictCount === 1) {
    console.log(">>> [PASSED] CONCURRENCY TEST: ZERO DOUBLE-BOOKING GUARANTEE VERIFIED!\n");
  } else {
    console.error(">>> [FAILED] Race condition allowed duplicate seat hold!\n");
    process.exit(1);
  }
}

runConcurrencyTest().catch((err) => {
  console.error(err);
  process.exit(1);
});

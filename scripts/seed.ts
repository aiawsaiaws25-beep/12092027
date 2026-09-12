import { store } from "../src/lib/store";

async function runSeed() {
  console.log("Seeding CineBook database with rich movies, cinemas, auditoriums, seats, and showtimes...");
  await store.init();
  console.log(`✓ Seeded ${store.movies.size} movies`);
  console.log(`✓ Seeded ${store.cinemas.size} cinemas`);
  console.log(`✓ Seeded ${store.auditoriums.size} auditoriums`);
  console.log(`✓ Generated ${store.seats.size} auditorium seats`);
  console.log(`✓ Scheduled ${store.showtimes.size} showtimes over 7 days`);
  console.log("Database seed completed successfully!");
}

runSeed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

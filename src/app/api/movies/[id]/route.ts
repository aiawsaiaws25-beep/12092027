import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await store.init();
  const movieIdentifier = params.id;

  // Lookup by ID or Slug
  let movie = store.movies.get(movieIdentifier);
  if (!movie) {
    movie = Array.from(store.movies.values()).find(
      (m) => m.slug === movieIdentifier
    );
  }

  if (!movie) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

  // Get all showtimes for this movie
  const showtimes = Array.from(store.showtimes.values())
    .filter((st) => st.movieId === movie!.id && st.status === "SCHEDULED")
    .map((st) => store.getShowtimeWithRelations(st.id))
    .filter(Boolean);

  // Group showtimes by cinema
  const cinemaMap = new Map<string, any>();
  for (const st of showtimes) {
    if (!st || !st.auditorium || !st.auditorium.cinema) continue;
    const cinema = st.auditorium.cinema;
    if (!cinemaMap.has(cinema.id)) {
      cinemaMap.set(cinema.id, {
        ...cinema,
        showtimes: [],
      });
    }
    cinemaMap.get(cinema.id).showtimes.push(st);
  }

  return NextResponse.json({
    movie,
    cinemasWithShowtimes: Array.from(cinemaMap.values()),
    allShowtimes: showtimes,
  });
}

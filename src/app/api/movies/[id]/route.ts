import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { SAMPLE_MOVIES } from "@/db/seed-data";

export const dynamic = "force-static";

export function generateStaticParams() {
  return SAMPLE_MOVIES.flatMap((m) => [{ id: m.id }, { id: m.slug }]);
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await store.init();
  const movieIdentifier = params.id;

  let movie = store.movies.get(movieIdentifier);
  if (!movie) {
    movie = Array.from(store.movies.values()).find(
      (m) => m.slug === movieIdentifier
    );
  }

  if (!movie) {
    const matched = SAMPLE_MOVIES.find((m) => m.slug === movieIdentifier || m.id === movieIdentifier) || SAMPLE_MOVIES[0];
    const { genreIds, ...rest } = matched;
    movie = {
      ...rest,
      genres: ["Action", "Sci-Fi", "Adventure"],
    };
  }

  const showtimes = Array.from(store.showtimes.values())
    .filter((st) => st.movieId === movie!.id && st.status === "SCHEDULED")
    .map((st) => store.getShowtimeWithRelations(st.id))
    .filter(Boolean);

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

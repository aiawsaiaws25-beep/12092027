import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-static";

export async function GET(request: Request) {
  await store.init();
  let search: string | undefined;
  let genre: string | undefined;
  let language: string | undefined;
  let status: string | null = null;

  try {
    if (request && request.url) {
      const { searchParams } = new URL(request.url);
      search = searchParams.get("search")?.toLowerCase();
      genre = searchParams.get("genre")?.toLowerCase();
      language = searchParams.get("language")?.toLowerCase();
      status = searchParams.get("status");
    }
  } catch (e) {}

  let movieList = Array.from(store.movies.values());

  if (status) {
    movieList = movieList.filter((m) => m.status === status);
  }

  if (search) {
    movieList = movieList.filter(
      (m) =>
        m.title.toLowerCase().includes(search) ||
        m.description.toLowerCase().includes(search)
    );
  }

  if (genre && genre !== "all") {
    movieList = movieList.filter((m) =>
      m.genres?.some((g) => g.toLowerCase() === genre || g.toLowerCase().replace(/\s+/g, "-") === genre)
    );
  }

  if (language && language !== "all") {
    movieList = movieList.filter(
      (m) => m.language.toLowerCase() === language
    );
  }

  const genres = Array.from(store.genres.values());
  const cinemas = Array.from(store.cinemas.values());

  return NextResponse.json({
    movies: movieList,
    genres,
    cinemas,
  });
}

export async function POST(request: Request) {
  await store.init();
  try {
    const body = await request.json();
    const { title, description, posterUrl, backdropUrl, trailerUrl, durationMins, rating, releaseDate, language, status, genres } = body;

    if (!title || !description || !posterUrl || !durationMins || !rating || !releaseDate || !language) {
      return NextResponse.json({ error: "Missing required movie fields" }, { status: 400 });
    }

    const id = `m-${Date.now()}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newMovie = {
      id,
      title,
      slug,
      description,
      posterUrl,
      backdropUrl: backdropUrl || null,
      trailerUrl: trailerUrl || null,
      durationMins: Number(durationMins),
      rating,
      releaseDate,
      language,
      status: status || "NOW_SHOWING",
      genres: Array.isArray(genres) ? genres : ["Action", "Drama"],
    };

    store.movies.set(id, newMovie);

    return NextResponse.json({ movie: newMovie }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create movie" }, { status: 500 });
  }
}

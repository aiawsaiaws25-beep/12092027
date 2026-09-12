import { SAMPLE_MOVIES } from "@/db/seed-data";
import MovieDetailClient from "./MovieDetailClient";

export function generateStaticParams() {
  return SAMPLE_MOVIES.flatMap((m) => [{ slug: m.slug }, { slug: m.id }]);
}

export default function MovieDetailPage() {
  return <MovieDetailClient />;
}

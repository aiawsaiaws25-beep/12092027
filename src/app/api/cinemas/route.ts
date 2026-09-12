import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  await store.init();
  const cinemas = Array.from(store.cinemas.values()).map((c) => {
    const auditoriums = Array.from(store.auditoriums.values()).filter(
      (a) => a.cinemaId === c.id
    );
    return {
      ...c,
      auditoriums,
    };
  });

  return NextResponse.json({ cinemas });
}

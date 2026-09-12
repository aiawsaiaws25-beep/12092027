import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await store.init();
  const showtimeId = params.id;
  const data = store.getShowtimeSeatMap(showtimeId);

  if (!data) {
    return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [
    { id: "st-0-a1111111-0" },
    { id: "st-0-a1111111-1" },
    { id: "st-0-a1111111-2" },
    { id: "st-0-a1111111-3" },
    { id: "preview" },
  ];
}

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

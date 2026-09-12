import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ id: "b-demo" }, { id: "preview" }, { id: "b-active-1" }, { id: "b-active-2" }];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await store.init();
  const booking = store.getBookingWithRelations(params.id);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

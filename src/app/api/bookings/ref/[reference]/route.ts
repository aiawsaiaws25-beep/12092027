import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ reference: "CB-DEMO" }, { reference: "preview" }, { reference: "CB-7X9K2L" }, { reference: "CB-3M8N1P" }];
}

export async function GET(
  request: Request,
  { params }: { params: { reference: string } }
) {
  await store.init();
  const booking = store.getBookingByReference(params.reference);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

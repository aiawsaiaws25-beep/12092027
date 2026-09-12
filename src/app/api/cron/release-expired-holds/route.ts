import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(request: Request) {
  return handleCleanup(request);
}

export async function POST(request: Request) {
  return handleCleanup(request);
}

async function handleCleanup(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "cinebook_cron_secret_token_change_in_prod";

  // Check if Bearer token matches CRON_SECRET (or allows local testing/dev calls)
  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    request.headers.get("x-cron-secret") === cronSecret ||
    process.env.NODE_ENV === "development";

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing CRON_SECRET" },
      { status: 401 }
    );
  }

  const result = await store.releaseExpiredHolds();

  return NextResponse.json({
    success: true,
    message: `Released ${result.releasedSeats} expired seat hold(s)`,
    ...result,
  });
}

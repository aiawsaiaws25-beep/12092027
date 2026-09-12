import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-static";

export async function GET(request: Request) {
  return handleCleanup(request);
}

export async function POST(request: Request) {
  return handleCleanup(request);
}

async function handleCleanup(request: Request) {
  let authHeader: string | null = null;
  let customHeader: string | null = null;
  try {
    authHeader = request?.headers?.get("authorization") || null;
    customHeader = request?.headers?.get("x-cron-secret") || null;
  } catch (e) {}
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

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";

export const dynamic = "force-static";

export async function GET() {
  await store.init();
  const session = await getCurrentUser();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = store.users.get(session.userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    },
  });
}

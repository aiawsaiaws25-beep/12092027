import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { hashPassword, signToken, getAuthCookieOptions } from "@/lib/auth";
import { User } from "@/lib/types";

export async function POST(request: Request) {
  try {
    await store.init();
    const body = await request.json();
    const { email, password, name, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = Array.from(store.users.values()).find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (existing) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    const passHash = await hashPassword(password);
    const userId = `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newUser: User = {
      id: userId,
      email: normalizedEmail,
      name,
      role: "CUSTOMER",
      phone: phone || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.users.set(userId, newUser);
    store.userPasswords.set(normalizedEmail, passHash);

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    const cookieOpts = getAuthCookieOptions();
    response.cookies.set(cookieOpts.name, token, cookieOpts);

    return response;
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: err.message || "Registration failed" },
      { status: 500 }
    );
  }
}

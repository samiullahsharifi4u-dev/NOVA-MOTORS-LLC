import { NextResponse } from "next/server";
import { getUserByEmail, updateUser } from "@/lib/users";
import type { User } from "@/lib/types";
import bundledUsers from "../../../../data/users.json";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const emailRaw: string = body.email ?? "";
    const passwordRaw: string = body.password ?? "";
    const email = emailRaw.trim().toLowerCase();
    const password = passwordRaw.trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    let user: User | undefined;
    try {
      user = getUserByEmail(email);
    } catch {
      // fs unavailable (e.g. Cloudflare Workers) — fall back to build-time bundled data
      user = (bundledUsers as unknown as User[]).find(
        (u) => u.email.toLowerCase() === email
      );
    }

    if (!user || user.password !== password || user.status !== "active") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Best-effort lastLogin update — don't let a write failure break login
    try {
      updateUser(user.id, { lastLogin: new Date().toISOString() });
    } catch {
      // ignore — write may fail in read-only environments
    }

    return NextResponse.json({
      token: "nova-admin-auth-token",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error("[auth] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getUserByEmail, updateUser } from "@/lib/users";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = getUserByEmail(email);

  if (!user || user.password !== password || user.status !== "active") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  updateUser(user.id, { lastLogin: new Date().toISOString() });

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
}

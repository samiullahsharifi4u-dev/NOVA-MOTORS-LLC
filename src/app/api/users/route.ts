export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { readUsers, createUser } from "@/lib/users";

function isAuthorized(req: Request): boolean {
  return req.headers.get("x-admin-token") === "nova-admin-auth-token";
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = readUsers().map(({ password: _pw, ...u }) => u);
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const { password: _pw, ...newUser } = createUser(data);
  return NextResponse.json(newUser, { status: 201 });
}

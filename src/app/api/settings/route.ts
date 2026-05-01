export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { readSettings, updateSettings } from "@/lib/settings";

function isAuthorized(req: Request): boolean {
  return req.headers.get("x-admin-token") === "nova-admin-auth-token";
}

export async function GET() {
  const settings = readSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const updated = updateSettings(data);
  return NextResponse.json(updated);
}

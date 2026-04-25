import { NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/lib/users";

function isAuthorized(req: Request): boolean {
  return req.headers.get("x-admin-token") === "nova-admin-auth-token";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const user = getUserById(id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { password: _pw, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const updated = updateUser(id, data);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { password: _pw, ...safeUser } = updated;
  return NextResponse.json(safeUser);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ok = deleteUser(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

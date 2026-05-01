export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { readInvoices, createInvoice } from "@/lib/invoices";

function isAuthorized(req: Request): boolean {
  return req.headers.get("x-admin-token") === "nova-admin-auth-token";
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let invoices = readInvoices();
  if (status) invoices = invoices.filter((i) => i.status === status);
  invoices.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const invoice = createInvoice(data);
  return NextResponse.json(invoice, { status: 201 });
}

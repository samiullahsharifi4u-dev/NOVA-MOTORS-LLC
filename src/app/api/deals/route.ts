import { NextResponse } from "next/server";
import { readDeals, createDeal } from "@/lib/deals";

function isAuthorized(req: Request): boolean {
  return req.headers.get("x-admin-token") === "nova-admin-auth-token";
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let deals = readDeals();
  if (status) deals = deals.filter((d) => d.status === status);
  deals.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(deals);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const deal = createDeal(data);
  return NextResponse.json(deal, { status: 201 });
}

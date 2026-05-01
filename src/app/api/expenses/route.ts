export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { readExpenses, createExpense } from "@/lib/expenses";

function isAuthorized(req: Request): boolean {
  return req.headers.get("x-admin-token") === "nova-admin-auth-token";
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const carId = searchParams.get("carId");

  let expenses = readExpenses();
  if (category) expenses = expenses.filter((e) => e.category === category);
  if (carId) expenses = expenses.filter((e) => e.carId === carId);
  expenses.sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const expense = createExpense(data);
  return NextResponse.json(expense, { status: 201 });
}

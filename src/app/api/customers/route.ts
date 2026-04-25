import { NextResponse } from "next/server";
import { readCustomers, createCustomer } from "@/lib/customers";

function isAuthorized(req: Request): boolean {
  return req.headers.get("x-admin-token") === "nova-admin-auth-token";
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();
  const status = searchParams.get("status");

  let customers = readCustomers();
  if (status) customers = customers.filter((c) => c.status === status);
  if (search) {
    customers = customers.filter(
      (c) =>
        c.firstName.toLowerCase().includes(search) ||
        c.lastName.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone.includes(search)
    );
  }
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const customer = createCustomer(data);
  return NextResponse.json(customer, { status: 201 });
}

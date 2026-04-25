import { NextResponse } from "next/server";
import { readAppointments, createAppointment } from "@/lib/appointments";

function isAuthorized(req: Request): boolean {
  return req.headers.get("x-admin-token") === "nova-admin-auth-token";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  let appointments = readAppointments();

  if (status) appointments = appointments.filter((a) => a.status === status);
  if (date) appointments = appointments.filter((a) => a.date === date);

  appointments.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();
  const appt = createAppointment(data);
  return NextResponse.json(appt, { status: 201 });
}

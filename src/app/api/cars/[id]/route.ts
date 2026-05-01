export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCarById, updateCar, deleteCar } from "@/lib/cars";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const car = getCarById(id);
  if (!car) {
    return NextResponse.json({ error: "Car not found" }, { status: 404 });
  }

  // Increment views
  updateCar(id, { views: (car.views || 0) + 1 });
  return NextResponse.json({ ...car, views: (car.views || 0) + 1 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get("x-admin-token");
  if (token !== "nova-admin-auth-token") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const updated = updateCar(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get("x-admin-token");
  if (token !== "nova-admin-auth-token") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteCar(id);
  if (!deleted) {
    return NextResponse.json({ error: "Car not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

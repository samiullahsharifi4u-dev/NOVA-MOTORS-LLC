import { NextRequest, NextResponse } from "next/server";
import { readCars, createCar } from "@/lib/cars";
import { Car } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let cars = readCars();

  if (status === "all") {
    // return all statuses (admin use)
  } else if (status) {
    cars = cars.filter((c) => c.status === status);
  } else {
    cars = cars.filter((c) => c.status === "active");
  }

  // Sort newest first by default
  cars.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(cars);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-admin-token");
  if (token !== "nova-admin-auth-token") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const car = createCar(body as Omit<Car, "id" | "createdAt" | "updatedAt" | "views">);
    return NextResponse.json(car, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

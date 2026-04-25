import fs from "fs";
import path from "path";
import { Car } from "./types";

const carsFilePath = path.join(process.cwd(), "data", "cars.json");

export function readCars(): Car[] {
  try {
    const data = fs.readFileSync(carsFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function writeCars(cars: Car[]): void {
  fs.writeFileSync(carsFilePath, JSON.stringify(cars, null, 2), "utf-8");
}

export function getCarById(id: string): Car | undefined {
  return readCars().find((car) => car.id === id);
}

export function createCar(
  data: Omit<Car, "id" | "createdAt" | "updatedAt" | "views">
): Car {
  const cars = readCars();
  const newCar: Car = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
  };
  cars.push(newCar);
  writeCars(cars);
  return newCar;
}

export function updateCar(id: string, updates: Partial<Car>): Car | null {
  const cars = readCars();
  const index = cars.findIndex((car) => car.id === id);
  if (index === -1) return null;
  cars[index] = {
    ...cars[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  writeCars(cars);
  return cars[index];
}

export function deleteCar(id: string): boolean {
  const cars = readCars();
  const filtered = cars.filter((car) => car.id !== id);
  if (filtered.length === cars.length) return false;
  writeCars(filtered);
  return true;
}

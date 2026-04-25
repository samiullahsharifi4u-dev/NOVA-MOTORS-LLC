import fs from "fs";
import path from "path";
import { Deal } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "deals.json");

export function readDeals(): Deal[] {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeDeals(deals: Deal[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(deals, null, 2));
}

export function getDealById(id: string): Deal | undefined {
  return readDeals().find((d) => d.id === id);
}

export function createDeal(data: Omit<Deal, "id" | "dealNumber" | "createdAt" | "updatedAt">): Deal {
  const deals = readDeals();
  const now = new Date().toISOString();
  const dealNumber = `NM-DEAL-${String(deals.length + 1).padStart(3, "0")}`;
  const newDeal: Deal = {
    ...data,
    id: `deal-${Date.now()}`,
    dealNumber,
    createdAt: now,
    updatedAt: now,
  };
  writeDeals([...deals, newDeal]);
  return newDeal;
}

export function updateDeal(id: string, data: Partial<Deal>): Deal | null {
  const deals = readDeals();
  const idx = deals.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  deals[idx] = { ...deals[idx], ...data, updatedAt: new Date().toISOString() };
  writeDeals(deals);
  return deals[idx];
}

export function deleteDeal(id: string): boolean {
  const deals = readDeals();
  const filtered = deals.filter((d) => d.id !== id);
  if (filtered.length === deals.length) return false;
  writeDeals(filtered);
  return true;
}

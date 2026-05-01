import fs from "fs";
import path from "path";
import { Customer } from "./types";
import bundledCustomers from "../../data/customers.json";

const DATA_PATH = path.join(process.cwd(), "data", "customers.json");

export function readCustomers(): Customer[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return bundledCustomers as unknown as Customer[];
  }
}

export function writeCustomers(customers: Customer[]): void {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(customers, null, 2));
  } catch {
    // write unavailable in read-only environments (e.g. Cloudflare Workers)
  }
}

export function getCustomerById(id: string): Customer | undefined {
  return readCustomers().find((c) => c.id === id);
}

export function createCustomer(data: Omit<Customer, "id" | "createdAt" | "updatedAt">): Customer {
  const customers = readCustomers();
  const now = new Date().toISOString();
  const newCustomer: Customer = {
    ...data,
    id: `cust-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  writeCustomers([...customers, newCustomer]);
  return newCustomer;
}

export function updateCustomer(id: string, data: Partial<Customer>): Customer | null {
  const customers = readCustomers();
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  customers[idx] = { ...customers[idx], ...data, updatedAt: new Date().toISOString() };
  writeCustomers(customers);
  return customers[idx];
}

export function deleteCustomer(id: string): boolean {
  const customers = readCustomers();
  const filtered = customers.filter((c) => c.id !== id);
  if (filtered.length === customers.length) return false;
  writeCustomers(filtered);
  return true;
}

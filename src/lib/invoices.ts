import fs from "fs";
import path from "path";
import { Invoice } from "./types";
import bundledInvoices from "../../data/invoices.json";

const DATA_PATH = path.join(process.cwd(), "data", "invoices.json");

export function readInvoices(): Invoice[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return bundledInvoices as unknown as Invoice[];
  }
}

export function writeInvoices(invoices: Invoice[]): void {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(invoices, null, 2));
  } catch {
    // write unavailable in read-only environments (e.g. Cloudflare Workers)
  }
}

export function getInvoiceById(id: string): Invoice | undefined {
  return readInvoices().find((i) => i.id === id);
}

export function createInvoice(data: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">): Invoice {
  const invoices = readInvoices();
  const year = new Date().getFullYear();
  const invoiceNumber = `INV-${year}-${String(invoices.length + 1).padStart(3, "0")}`;
  const newInvoice: Invoice = {
    ...data,
    id: `inv-${Date.now()}`,
    invoiceNumber,
    createdAt: new Date().toISOString(),
  };
  writeInvoices([...invoices, newInvoice]);
  return newInvoice;
}

export function updateInvoice(id: string, data: Partial<Invoice>): Invoice | null {
  const invoices = readInvoices();
  const idx = invoices.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  invoices[idx] = { ...invoices[idx], ...data };
  writeInvoices(invoices);
  return invoices[idx];
}

export function deleteInvoice(id: string): boolean {
  const invoices = readInvoices();
  const filtered = invoices.filter((i) => i.id !== id);
  if (filtered.length === invoices.length) return false;
  writeInvoices(filtered);
  return true;
}

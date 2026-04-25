import fs from "fs";
import path from "path";
import { Expense } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "expenses.json");

export function readExpenses(): Expense[] {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeExpenses(expenses: Expense[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(expenses, null, 2));
}

export function getExpenseById(id: string): Expense | undefined {
  return readExpenses().find((e) => e.id === id);
}

export function createExpense(data: Omit<Expense, "id" | "createdAt">): Expense {
  const expenses = readExpenses();
  const newExpense: Expense = {
    ...data,
    id: `exp-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  writeExpenses([...expenses, newExpense]);
  return newExpense;
}

export function updateExpense(id: string, data: Partial<Expense>): Expense | null {
  const expenses = readExpenses();
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  expenses[idx] = { ...expenses[idx], ...data };
  writeExpenses(expenses);
  return expenses[idx];
}

export function deleteExpense(id: string): boolean {
  const expenses = readExpenses();
  const filtered = expenses.filter((e) => e.id !== id);
  if (filtered.length === expenses.length) return false;
  writeExpenses(filtered);
  return true;
}

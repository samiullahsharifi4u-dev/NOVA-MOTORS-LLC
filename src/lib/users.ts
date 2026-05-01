import fs from "fs";
import path from "path";
import { User } from "./types";
import bundledUsers from "../../data/users.json";

const DATA_PATH = path.join(process.cwd(), "data", "users.json");

export function readUsers(): User[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return bundledUsers as unknown as User[];
  }
}

export function writeUsers(users: User[]): void {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(users, null, 2));
  } catch {
    // write unavailable in read-only environments (e.g. Cloudflare Workers)
  }
}

export function getUserById(id: string): User | undefined {
  return readUsers().find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(data: Omit<User, "id" | "createdAt" | "lastLogin">): User {
  const users = readUsers();
  const newUser: User = {
    ...data,
    id: `user-${Date.now()}`,
    lastLogin: null,
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, newUser]);
  return newUser;
}

export function updateUser(id: string, data: Partial<User>): User | null {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...data };
  writeUsers(users);
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const users = readUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  writeUsers(filtered);
  return true;
}

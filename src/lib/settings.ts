import fs from "fs";
import path from "path";
import { SiteSettings } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "settings.json");

export function readSettings(): SiteSettings {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeSettings(settings: SiteSettings): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(settings, null, 2));
}

export function updateSettings(data: Partial<SiteSettings>): SiteSettings {
  const current = readSettings();
  const updated = { ...current, ...data };
  writeSettings(updated);
  return updated;
}

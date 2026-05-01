import fs from "fs";
import path from "path";
import { SiteSettings } from "./types";
import bundledSettings from "../../data/settings.json";

const DATA_PATH = path.join(process.cwd(), "data", "settings.json");

export function readSettings(): SiteSettings {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return bundledSettings as unknown as SiteSettings;
  }
}

export function writeSettings(settings: SiteSettings): void {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(settings, null, 2));
  } catch {
    // write unavailable in read-only environments (e.g. Cloudflare Workers)
  }
}

export function updateSettings(data: Partial<SiteSettings>): SiteSettings {
  const current = readSettings();
  const updated = { ...current, ...data };
  writeSettings(updated);
  return updated;
}

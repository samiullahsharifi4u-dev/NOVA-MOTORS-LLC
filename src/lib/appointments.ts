import fs from "fs";
import path from "path";
import { Appointment } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "appointments.json");

export function readAppointments(): Appointment[] {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeAppointments(appointments: Appointment[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(appointments, null, 2));
}

export function getAppointmentById(id: string): Appointment | undefined {
  return readAppointments().find((a) => a.id === id);
}

export function createAppointment(data: Omit<Appointment, "id" | "createdAt">): Appointment {
  const appointments = readAppointments();
  const newAppt: Appointment = {
    ...data,
    id: `appt-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  writeAppointments([...appointments, newAppt]);
  return newAppt;
}

export function updateAppointment(id: string, data: Partial<Appointment>): Appointment | null {
  const appointments = readAppointments();
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  appointments[idx] = { ...appointments[idx], ...data };
  writeAppointments(appointments);
  return appointments[idx];
}

export function deleteAppointment(id: string): boolean {
  const appointments = readAppointments();
  const filtered = appointments.filter((a) => a.id !== id);
  if (filtered.length === appointments.length) return false;
  writeAppointments(filtered);
  return true;
}

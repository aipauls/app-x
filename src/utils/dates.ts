import { ExpiryStatus } from "../types/pantry";

export function daysFromNow(dateStr: string): number {
  if (!dateStr) return 999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

export function getExpiryLabel(dateStr: string): string {
  if (!dateStr) return "";
  const days = daysFromNow(dateStr);
  if (days < 0) return "Expired";
  if (days === 0) return "Today!";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

export function getExpiryStatus(dateStr: string): ExpiryStatus {
  if (!dateStr) return "none";
  const days = daysFromNow(dateStr);
  if (days < 0) return "expired";
  if (days <= 2) return "urgent";
  if (days <= 5) return "soon";
  return "ok";
}

export function defaultExpiry(daysAhead: number = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

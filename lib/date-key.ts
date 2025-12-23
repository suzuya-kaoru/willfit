import { format } from "date-fns";

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

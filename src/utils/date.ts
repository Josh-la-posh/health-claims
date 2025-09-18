// src/utils/date.ts
import { format, differenceInDays, isBefore } from "date-fns";
import { parseISO } from "date-fns/parseISO";

// import { format } from "date-fns";

/** Format a Date or ISO string */
export function formatDate(date: string | Date, fmt: string = "dd MMM yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

/** Format date + time */
export function formatDateTime(date: string | Date, fmt: string = "dd MMM yyyy HH:mm"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

/** Check if date1 is before date2 */
export function isDateBefore(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
  const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
  return isBefore(d1, d2);
}

/** Difference in days */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
  const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
  return differenceInDays(d1, d2);
}

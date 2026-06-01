import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";

/** J+1 après dateEcheance → éligible OVERDUE */
export function isPastDue(dateEcheance: Date, now = new Date()): boolean {
  const dueDay = startOfDay(dateEcheance);
  const overdueFrom = addDays(dueDay, 1);
  return startOfDay(now) >= overdueFrom;
}

export function daysUntilDue(dateEcheance: Date, now = new Date()): number {
  return differenceInCalendarDays(startOfDay(dateEcheance), startOfDay(now));
}

export function daysOverdue(dateEcheance: Date, now = new Date()): number {
  const d = daysUntilDue(dateEcheance, now);
  return d < 0 ? Math.abs(d) : 0;
}

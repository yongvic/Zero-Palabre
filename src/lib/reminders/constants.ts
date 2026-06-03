/** Jours avant échéance où une relance est envoyée (in-app + email). */
export const DUE_REMINDER_DAYS_BEFORE = [7, 3, 1, 0] as const;

export type DueReminderDaysBefore = (typeof DUE_REMINDER_DAYS_BEFORE)[number];

export const DUE_REMINDER_ELIGIBLE_STATUTS = [
  "ACCEPTED",
  "ACTIVE",
  "REPAYING",
  "ESCROW_FUNDED",
] as const;

import { addHours } from "date-fns";
import { INVITE_EXPIRY_HOURS } from "@/lib/constants";

export type AccordInviteTiming = {
  inviteExpiresAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
};

/** Date limite : 5 h après l'envoi (ou la création si non envoyé). */
export function resolveInviteExpiresAt(accord: AccordInviteTiming): Date {
  const base = accord.sentAt ?? accord.createdAt;
  return addHours(base, INVITE_EXPIRY_HOURS);
}

export function isInviteExpired(accord: AccordInviteTiming, now = new Date()): boolean {
  return resolveInviteExpiresAt(accord) < now;
}

export function inviteExpiryLabel(): string {
  const hours = INVITE_EXPIRY_HOURS as number;
  return hours === 1 ? "1 heure" : `${hours} heures`;
}

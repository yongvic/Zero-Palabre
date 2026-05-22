import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMontant(
  montant: number | string | null | undefined,
  devise = "FCFA"
): string {
  if (montant == null || montant === "") return "—";
  const n = typeof montant === "string" ? parseFloat(montant) : montant;
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(n) + ` ${devise}`;
}

/**
 * Variante PDF-safe : remplace les séparateurs de milliers Unicode
 * (espace fine insécable U+202F) par des espaces normaux.
 * @react-pdf/renderer ne supporte pas U+202F et l'affiche comme "/".
 */
export function formatMontantPdf(
  montant: number | string | null | undefined,
  devise = "FCFA"
): string {
  if (montant == null || montant === "") return "—";
  const n = typeof montant === "string" ? parseFloat(montant) : montant;
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(n);
  // Remplace U+202F (espace fine insécable) et U+00A0 (espace insécable) par espace normale
  return formatted.replace(/[\u202F\u00A0]/g, " ") + ` ${devise}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function statutToBadgeVariant(statut: string): "default" | "pending" | "sent" | "viewed" | "accepted" | "rejected" | "expired" | "honored" | "disputed" {
  const map: Record<string, "default" | "pending" | "sent" | "viewed" | "accepted" | "rejected" | "expired" | "honored" | "disputed"> = {
    PENDING: "pending",
    SENT: "sent",
    VIEWED: "viewed",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    EXPIRED: "expired",
    HONORED: "honored",
    DISPUTED: "disputed",
  };
  return map[statut] ?? "default";
}

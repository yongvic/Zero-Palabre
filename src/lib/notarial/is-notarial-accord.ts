import type { Accord } from "@prisma/client";

export function isNotarialWalletAccord(
  accord: Pick<Accord, "counterpartyUsername" | "repaymentMode">
): boolean {
  return Boolean(accord.counterpartyUsername && accord.repaymentMode);
}

export const NOTARIAL_REPAYMENT_STATUTS = [
  "ESCROW_FUNDED",
  "ACTIVE",
  "REPAYING",
  "OVERDUE",
] as const;

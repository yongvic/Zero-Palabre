import { prisma } from "@/lib/prisma";
import type { Accord } from "@prisma/client";

const FULFILLMENT_ELIGIBLE = ["ACCEPTED", "OVERDUE"] as const;

export function accordNeedsFulfillment(
  accord: Pick<Accord, "montant" | "statut">
): boolean {
  return accord.montant != null && FULFILLMENT_ELIGIBLE.includes(accord.statut as "ACCEPTED" | "OVERDUE");
}

export async function ensureFulfillmentRecord(accordId: string) {
  const accord = await prisma.accord.findUnique({ where: { id: accordId } });
  if (!accord || !accordNeedsFulfillment(accord)) return null;

  return prisma.accordFulfillment.upsert({
    where: { accordId },
    create: { accordId, status: "PENDING" },
    update: {},
  });
}

export async function getFulfillmentByToken(fulfillToken: string) {
  return prisma.accordFulfillment.findUnique({
    where: { fulfillToken },
    include: {
      accord: { include: { initiateur: { select: { name: true, email: true } } } },
    },
  });
}

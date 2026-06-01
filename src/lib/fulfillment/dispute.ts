import { prisma } from "@/lib/prisma";
import { updateReliabilityScore } from "@/lib/reliability";

export async function openDispute(
  accordId: string,
  userId: string,
  reason: string
) {
  const accord = await prisma.accord.findUnique({ where: { id: accordId } });
  if (!accord) throw new Error("ACCORD_NOT_FOUND");

  const isParty =
    accord.initiateurId === userId ||
    accord.destinataireId === userId;
  if (!isParty) throw new Error("NOT_PARTY");

  if (!["ACCEPTED", "OVERDUE"].includes(accord.statut)) {
    throw new Error("NOT_ELIGIBLE");
  }

  await prisma.$transaction([
    prisma.accord.update({
      where: { id: accordId },
      data: { statut: "DISPUTED" },
    }),
    prisma.accordEvent.create({
      data: {
        accordId,
        type: "DISPUTED",
        metadata: { reason: reason.trim(), openedBy: userId },
      },
    }),
  ]);

  await updateReliabilityScore(accord.initiateurId, "DISPUTED");

  return { statut: "DISPUTED" as const };
}

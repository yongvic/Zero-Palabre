import { prisma } from "@/lib/prisma";
import { updateReliabilityScore } from "@/lib/reliability";
import { accordFulfillmentRejectedEmail } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/resend";

export async function rejectFulfillment(
  accordId: string,
  creditorUserId: string,
  reason: string
) {
  const accord = await prisma.accord.findUnique({
    where: { id: accordId },
    include: { fulfillment: true },
  });

  if (!accord) throw new Error("ACCORD_NOT_FOUND");
  if (accord.initiateurId !== creditorUserId) throw new Error("NOT_CREDITOR");
  if (!accord.fulfillment || accord.fulfillment.status !== "DECLARED") {
    throw new Error("NOT_DECLARED");
  }

  const f = accord.fulfillment;

  await prisma.$transaction([
    prisma.accordFulfillment.update({
      where: { id: f.id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectReason: reason.trim(),
      },
    }),
    prisma.accord.update({
      where: { id: accordId },
      data: { statut: "DISPUTED" },
    }),
    prisma.accordEvent.create({
      data: {
        accordId,
        type: "FULFILLMENT_REJECTED",
        metadata: { reason: reason.trim() },
      },
    }),
    prisma.accordEvent.create({
      data: { accordId, type: "DISPUTED", metadata: { reason: reason.trim() } },
    }),
  ]);

  await updateReliabilityScore(accord.initiateurId, "DISPUTED");

  if (f.declaredEmail) {
    await sendTransactionalEmail({
      to: f.declaredEmail,
      subject: `[Zéro-Palabre] Déclaration de paiement refusée`,
      html: accordFulfillmentRejectedEmail({
        titre: accord.titre,
        reason: reason.trim(),
      }),
    });
  }

  return { statut: "DISPUTED" as const };
}

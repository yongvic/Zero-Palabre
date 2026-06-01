import { prisma } from "@/lib/prisma";
import { updateReliabilityScore } from "@/lib/reliability";
import { accordHonoredEmail } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/resend";
import { buildFulfillmentPayload, hashFulfillment } from "./hash";
import { computeTrustLevel } from "./trust";

export async function confirmFulfillment(accordId: string, creditorUserId: string) {
  const accord = await prisma.accord.findUnique({
    where: { id: accordId },
    include: { initiateur: true, fulfillment: true },
  });

  if (!accord) throw new Error("ACCORD_NOT_FOUND");
  if (accord.initiateurId !== creditorUserId) throw new Error("NOT_CREDITOR");
  if (!accord.fulfillment || accord.fulfillment.status !== "DECLARED") {
    throw new Error("NOT_DECLARED");
  }

  const f = accord.fulfillment;
  if (!f.amountDeclared || !f.paidAt || !f.paymentMethod || !f.declaredName || !f.declaredEmail || !f.declaredAt) {
    throw new Error("INCOMPLETE_DECLARATION");
  }

  const confirmedAt = new Date();
  const hasProof = Boolean(f.proofData);
  const trustLevel = computeTrustLevel(hasProof);

  const payload = buildFulfillmentPayload({
    accordReference: accord.reference,
    contentHash: accord.contentHash,
    amountDeclared: f.amountDeclared.toString(),
    paidAt: f.paidAt.toISOString(),
    paymentMethod: f.paymentMethod,
    reference: f.reference,
    declaredName: f.declaredName,
    declaredEmail: f.declaredEmail,
    declaredAt: f.declaredAt.toISOString(),
    confirmedAt: confirmedAt.toISOString(),
    confirmedByEmail: accord.initiateur.email,
    hasProof,
  });

  const fulfillmentHash = hashFulfillment(payload);

  await prisma.$transaction([
    prisma.accordFulfillment.update({
      where: { id: f.id },
      data: {
        status: "CONFIRMED",
        confirmedAt,
        confirmedById: creditorUserId,
        fulfillmentHash,
        trustLevel,
      },
    }),
    prisma.accord.update({
      where: { id: accordId },
      data: { statut: "HONORED" },
    }),
    prisma.accordEvent.create({
      data: {
        accordId,
        type: "FULFILLMENT_CONFIRMED",
        metadata: { fulfillmentHash, trustLevel },
      },
    }),
    prisma.accordEvent.create({
      data: { accordId, type: "HONORED" },
    }),
  ]);

  await updateReliabilityScore(accord.initiateurId, "HONORED");
  if (accord.destinataireId) {
    await updateReliabilityScore(accord.destinataireId, "HONORED");
  }

  await sendTransactionalEmail({
    to: f.declaredEmail,
    subject: `[Zéro-Palabre] Remboursement confirmé — ${accord.titre}`,
    html: accordHonoredEmail({
      titre: accord.titre,
      reference: accord.reference,
      verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/verifier/${accord.publicToken}`,
    }),
  });

  return { fulfillmentHash, trustLevel };
}

import { prisma } from "@/lib/prisma";
import { accordDeclaredEmail } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/resend";
import type { DeclareFulfillmentInput } from "./types";
import { ensureFulfillmentRecord } from "./record";

export async function declareFulfillment(
  accordId: string,
  input: DeclareFulfillmentInput
) {
  const accord = await prisma.accord.findUnique({
    where: { id: accordId },
    include: { initiateur: true, fulfillment: true },
  });

  if (!accord) throw new Error("ACCORD_NOT_FOUND");
  if (!["ACCEPTED", "OVERDUE"].includes(accord.statut)) {
    throw new Error("ACCORD_NOT_ELIGIBLE");
  }
  if (!accord.montant) throw new Error("NO_AMOUNT");

  const expected = Number(accord.montant);
  if (Math.abs(input.amountDeclared - expected) > 0.01) {
    throw new Error("AMOUNT_MISMATCH");
  }

  if (input.declaredEmail.toLowerCase() !== accord.destinataireEmail.toLowerCase()) {
    throw new Error("EMAIL_MISMATCH");
  }

  await ensureFulfillmentRecord(accordId);

  const paidAt = new Date(input.paidAt);
  if (Number.isNaN(paidAt.getTime())) throw new Error("INVALID_DATE");

  const fulfillment = await prisma.accordFulfillment.update({
    where: { accordId },
    data: {
      status: "DECLARED",
      amountDeclared: input.amountDeclared,
      paidAt,
      paymentMethod: input.paymentMethod,
      reference: input.reference ?? null,
      proofData: input.proofUrl ?? null,
      declaredName: input.declaredName.trim(),
      declaredEmail: input.declaredEmail.trim().toLowerCase(),
      declaredAt: new Date(),
    },
  });

  await prisma.accordEvent.create({
    data: {
      accordId,
      type: "FULFILLMENT_DECLARED",
      metadata: {
        amount: input.amountDeclared,
        paymentMethod: input.paymentMethod,
        paidAt: paidAt.toISOString(),
        hasProof: Boolean(input.proofUrl),
      },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendTransactionalEmail({
    to: accord.initiateur.email,
    subject: `[Zéro-Palabre] Remboursement déclaré — ${accord.titre}`,
    html: accordDeclaredEmail({
      debtorName: input.declaredName,
      titre: accord.titre,
      reference: accord.reference,
      confirmUrl: `${baseUrl}/accords/${accord.id}/execution`,
    }),
  });

  return fulfillment;
}

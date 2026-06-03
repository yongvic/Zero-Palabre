import { prisma } from "@/lib/prisma";
import { accordOverdueEmail } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/resend";
import { isPastDue } from "./schedule";
import { ensureFulfillmentRecord } from "./record";

export async function markOverdueAccords() {
  const candidates = await prisma.accord.findMany({
    where: {
      statut: { in: ["ACCEPTED", "ACTIVE", "REPAYING"] },
      dateEcheance: { not: null },
      montant: { not: null },
      repaymentMode: { not: "SCHEDULED_DEBIT" },
    },
    include: { initiateur: true },
  });

  let marked = 0;

  for (const accord of candidates) {
    if (!accord.dateEcheance || !isPastDue(accord.dateEcheance)) continue;

    await prisma.accord.update({
      where: { id: accord.id },
      data: { statut: "OVERDUE" },
    });

    await prisma.accordEvent.create({
      data: { accordId: accord.id, type: "OVERDUE_MARKED" },
    });

    await ensureFulfillmentRecord(accord.id);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const fulfillment = await prisma.accordFulfillment.findUnique({
      where: { accordId: accord.id },
    });
    const executerUrl = fulfillment
      ? `${baseUrl}/executer/${fulfillment.fulfillToken}`
      : `${baseUrl}/valider/${accord.publicToken}`;

    const html = accordOverdueEmail({
      titre: accord.titre,
      reference: accord.reference,
      executerUrl,
      dashboardUrl: `${baseUrl}/accords/${accord.id}`,
    });

    await sendTransactionalEmail({
      to: accord.initiateur.email,
      subject: `[Zéro-Palabre] Échéance dépassée — ${accord.titre}`,
      html,
    });

    await sendTransactionalEmail({
      to: accord.destinataireEmail,
      subject: `[Zéro-Palabre] Rappel : échéance dépassée — ${accord.titre}`,
      html,
    });

    marked++;
  }

  return { marked };
}

import { prisma } from "@/lib/prisma";
import { executeScheduledRepayment } from "@/lib/wallet/repayment";
import { accordOverdueEmail } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/resend";
import { isPastDue } from "@/lib/fulfillment/schedule";
import { ensureFulfillmentRecord } from "@/lib/fulfillment/record";

export async function processScheduledRepayments() {
  const candidates = await prisma.accord.findMany({
    where: {
      repaymentMode: "SCHEDULED_DEBIT",
      counterpartyUsername: { not: null },
      statut: { in: ["ACTIVE", "ESCROW_FUNDED", "OVERDUE"] },
      dateEcheance: { not: null },
      montant: { not: null },
    },
    include: { initiateur: true, destinataire: true },
  });

  let honored = 0;
  let failed = 0;
  let overdueMarked = 0;

  for (const accord of candidates) {
    if (!accord.dateEcheance || !isPastDue(accord.dateEcheance)) continue;

    const result = await executeScheduledRepayment(accord.id);

    if (result.status === "honored" || result.status === "already_honored") {
      honored++;
      continue;
    }

    if (result.status === "insufficient_balance") {
      if (accord.statut !== "OVERDUE") {
        await prisma.accord.update({
          where: { id: accord.id },
          data: { statut: "OVERDUE" },
        });
        await prisma.accordEvent.create({
          data: { accordId: accord.id, type: "OVERDUE_MARKED", metadata: { source: "scheduled_debit" } },
        });
        overdueMarked++;
      }

      await ensureFulfillmentRecord(accord.id);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const html = accordOverdueEmail({
        titre: accord.titre,
        reference: accord.reference,
        executerUrl: `${baseUrl}/accords/${accord.id}`,
        dashboardUrl: `${baseUrl}/accords/${accord.id}`,
      });

      await sendTransactionalEmail({
        to: accord.initiateur.email,
        subject: `[Zéro-Palabre] Prélèvement échoué — solde insuffisant`,
        html,
      });

      if (accord.destinataire?.email) {
        await sendTransactionalEmail({
          to: accord.destinataire.email,
          subject: `[Zéro-Palabre] Rechargez votre portefeuille pour rembourser`,
          html,
        });
      }

      failed++;
    }
  }

  return { honored, failed, overdueMarked, scanned: candidates.length };
}

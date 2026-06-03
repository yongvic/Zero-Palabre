import { prisma } from "@/lib/prisma";
import { daysUntilDue } from "@/lib/fulfillment/schedule";
import { formatDate, formatMontant } from "@/lib/utils";
import { createUserNotification } from "@/lib/notifications/store";
import { accordDueReminderEmail } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/resend";
import { REPAYMENT_MODE_LABELS } from "@/lib/constants";
import {
  DUE_REMINDER_DAYS_BEFORE,
  DUE_REMINDER_ELIGIBLE_STATUTS,
} from "./constants";
import type { Accord, User } from "@prisma/client";

type AccordWithParties = Accord & {
  initiateur: User;
  destinataire: User | null;
};

function reminderCopy(
  accord: AccordWithParties,
  role: "borrower" | "lender",
  daysBefore: number
): { title: string; body: string } {
  const montant = accord.montant ? formatMontant(Number(accord.montant), accord.devise) : "";
  const dateStr = accord.dateEcheance ? formatDate(accord.dateEcheance) : "";
  const when =
    daysBefore === 0
      ? "aujourd'hui"
      : daysBefore === 1
        ? "demain"
        : `dans ${daysBefore} jours`;

  if (role === "borrower") {
    const modeHint =
      accord.repaymentMode === "SCHEDULED_DEBIT"
        ? " Le montant sera prélevé automatiquement sur votre portefeuille à l'échéance si votre solde est suffisant."
        : accord.repaymentMode === "MUTUAL_CONFIRM"
          ? " Pensez à rembourser depuis votre portefeuille avant cette date."
          : "";

    return {
      title: `Échéance ${when} — ${accord.titre}`,
      body: `Montant dû : ${montant} · Date : ${dateStr}.${modeHint}`,
    };
  }

  const partner = accord.destinataire?.name ?? accord.destinataireNom;
  return {
    title: `Échéance ${when} — ${accord.titre}`,
    body: `${partner} doit rembourser ${montant} avant le ${dateStr}.`,
  };
}

async function notifyUser(input: {
  accord: AccordWithParties;
  user: User;
  role: "borrower" | "lender";
  daysBefore: number;
}) {
  const { accord, user, role, daysBefore } = input;
  const { title, body } = reminderCopy(accord, role, daysBefore);
  const dedupeKey = `due:${accord.id}:${daysBefore}:${user.id}`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const href = `/accords/${accord.id}`;

  const { created } = await createUserNotification({
    userId: user.id,
    type: "DUE_DATE_REMINDER",
    title,
    body,
    href,
    accordId: accord.id,
    dedupeKey,
  });

  if (!created) return false;

  await prisma.accordEvent.create({
    data: {
      accordId: accord.id,
      type: "REMINDER_SENT",
      metadata: { daysBefore, userId: user.id, role },
    },
  });

  await sendTransactionalEmail({
    to: user.email,
    subject: `[Zéro-Palabre] Rappel échéance — ${accord.titre}`,
    html: accordDueReminderEmail({
      titre: accord.titre,
      reference: accord.reference,
      daysBefore,
      montant: accord.montant ? formatMontant(Number(accord.montant), accord.devise) : "—",
      dateEcheance: accord.dateEcheance ? formatDate(accord.dateEcheance) : "—",
      role,
      repaymentModeLabel: accord.repaymentMode
        ? REPAYMENT_MODE_LABELS[accord.repaymentMode]
        : undefined,
      accordUrl: `${baseUrl}${href}`,
    }),
  });

  return true;
}

export async function sendDueDateReminders() {
  const accords = await prisma.accord.findMany({
    where: {
      statut: { in: [...DUE_REMINDER_ELIGIBLE_STATUTS] },
      dateEcheance: { not: null },
      montant: { not: null },
    },
    include: { initiateur: true, destinataire: true, fulfillment: true },
  });

  let sent = 0;
  let skipped = 0;

  for (const accord of accords) {
    if (!accord.dateEcheance) continue;

    const daysBefore = daysUntilDue(accord.dateEcheance);
    if (!DUE_REMINDER_DAYS_BEFORE.includes(daysBefore as (typeof DUE_REMINDER_DAYS_BEFORE)[number])) {
      continue;
    }

    if (accord.fulfillment?.status === "DECLARED" || accord.fulfillment?.status === "CONFIRMED") {
      skipped++;
      continue;
    }

    const borrower = accord.destinataire;
    if (borrower) {
      const ok = await notifyUser({
        accord,
        user: borrower,
        role: "borrower",
        daysBefore,
      });
      if (ok) sent++;
    }

    const okLender = await notifyUser({
      accord,
      user: accord.initiateur,
      role: "lender",
      daysBefore,
    });
    if (okLender) sent++;
  }

  return { sent, skipped, scanned: accords.length };
}

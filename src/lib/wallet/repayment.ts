import { prisma } from "@/lib/prisma";
import { getOrCreateWallet } from "./ledger";
import { ensureFulfillmentRecord } from "@/lib/fulfillment/record";
import { buildFulfillmentPayload, hashFulfillment } from "@/lib/fulfillment/hash";
import { computeTrustLevel } from "@/lib/fulfillment/trust";
import { updateReliabilityScore } from "@/lib/reliability";
import { accordHonoredEmail } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/resend";
import { isNotarialWalletAccord } from "@/lib/notarial/is-notarial-accord";

export async function executeWalletTransfer(accordId: string) {
  const accord = await prisma.accord.findUnique({
    where: { id: accordId },
    include: { initiateur: true, destinataire: true },
  });

  if (!accord?.montant || !accord.destinataireId) {
    throw new Error("ACCORD_NOT_ELIGIBLE");
  }

  const amount = Number(accord.montant);
  if (amount <= 0) throw new Error("ACCORD_NOT_ELIGIBLE");

  const borrowerWallet = await getOrCreateWallet(accord.destinataireId);
  const lenderWallet = await getOrCreateWallet(accord.initiateurId);

  return prisma.$transaction(async (tx) => {
    const borrower = await tx.wallet.findUniqueOrThrow({ where: { id: borrowerWallet.id } });
    const lender = await tx.wallet.findUniqueOrThrow({ where: { id: lenderWallet.id } });

    if (borrower.balanceAvailable.lessThan(amount)) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    const borrowerAfter = borrower.balanceAvailable.sub(amount);
    const lenderAfter = lender.balanceAvailable.add(amount);

    await tx.wallet.update({
      where: { id: borrower.id },
      data: { balanceAvailable: borrowerAfter },
    });
    await tx.wallet.update({
      where: { id: lender.id },
      data: { balanceAvailable: lenderAfter },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: borrower.id,
        type: "TRANSFER_OUT",
        amount,
        balanceAfter: borrowerAfter,
        label: `Remboursement ${accord.reference}`,
        accordId,
        status: "COMPLETED",
      },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: lender.id,
        type: "TRANSFER_IN",
        amount,
        balanceAfter: lenderAfter,
        label: `Remboursement reçu ${accord.reference}`,
        accordId,
        status: "COMPLETED",
      },
    });

    await tx.accordEvent.create({
      data: { accordId, type: "REPAYMENT_TRANSFER", metadata: { amount } },
    });

    return { amount, borrowerAfter: Number(borrowerAfter), lenderAfter: Number(lenderAfter) };
  });
}

export async function declareWalletRepayment(accordId: string, borrowerUserId: string) {
  const accord = await prisma.accord.findFirst({
    where: {
      id: accordId,
      destinataireId: borrowerUserId,
      counterpartyUsername: { not: null },
      repaymentMode: "MUTUAL_CONFIRM",
      statut: { in: ["ACTIVE", "ESCROW_FUNDED", "OVERDUE", "REPAYING"] },
    },
    include: { destinataire: true, fulfillment: true },
  });

  if (!accord?.montant || !accord.destinataire) {
    throw new Error("ACCORD_NOT_ELIGIBLE");
  }

  if (accord.fulfillment?.status === "DECLARED") {
    throw new Error("ALREADY_DECLARED");
  }

  const amount = Number(accord.montant);
  const wallet = await getOrCreateWallet(borrowerUserId);
  if (wallet.balanceAvailable.lessThan(amount)) {
    throw new Error("INSUFFICIENT_BALANCE");
  }

  await ensureFulfillmentRecord(accordId);
  const now = new Date();

  await prisma.$transaction([
    prisma.accordFulfillment.update({
      where: { accordId },
      data: {
        status: "DECLARED",
        amountDeclared: amount,
        paidAt: now,
        paymentMethod: "OTHER",
        reference: `ZP-WALLET-${accord.reference}`,
        declaredName: accord.destinataire.name ?? accord.destinataireNom,
        declaredEmail: accord.destinataire.email,
        declaredAt: now,
      },
    }),
    prisma.accord.update({
      where: { id: accordId },
      data: { statut: "REPAYING" },
    }),
    prisma.accordEvent.create({
      data: {
        accordId,
        type: "FULFILLMENT_DECLARED",
        metadata: { source: "wallet" },
      },
    }),
  ]);
}

async function finalizeHonoredAccord(
  accordId: string,
  confirmedById: string,
  autoConfirmed: boolean
) {
  const accord = await prisma.accord.findUnique({
    where: { id: accordId },
    include: {
      initiateur: true,
      destinataire: true,
      fulfillment: true,
      notarialAct: true,
    },
  });

  if (!accord?.fulfillment || accord.fulfillment.status !== "DECLARED") {
    throw new Error("NOT_DECLARED");
  }

  const f = accord.fulfillment;
  if (!f.amountDeclared || !f.paidAt || !f.declaredName || !f.declaredEmail || !f.declaredAt) {
    throw new Error("INCOMPLETE_DECLARATION");
  }

  const confirmedAt = new Date();
  const contentHash = accord.notarialAct?.contentHash ?? accord.contentHash ?? "";

  const payload = buildFulfillmentPayload({
    accordReference: accord.reference,
    contentHash,
    amountDeclared: f.amountDeclared.toString(),
    paidAt: f.paidAt.toISOString(),
    paymentMethod: f.paymentMethod ?? "OTHER",
    reference: f.reference,
    declaredName: f.declaredName,
    declaredEmail: f.declaredEmail,
    declaredAt: f.declaredAt.toISOString(),
    confirmedAt: confirmedAt.toISOString(),
    confirmedByEmail: accord.initiateur.email,
    hasProof: false,
  });

  const fulfillmentHash = hashFulfillment(payload);
  const trustLevel = computeTrustLevel(false);

  await prisma.$transaction([
    prisma.accordFulfillment.update({
      where: { id: f.id },
      data: {
        status: "CONFIRMED",
        confirmedAt,
        confirmedById,
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
        metadata: { fulfillmentHash, trustLevel, autoConfirmed },
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

export async function confirmWalletRepayment(accordId: string, lenderUserId: string) {
  const accord = await prisma.accord.findUnique({
    where: { id: accordId },
    include: { fulfillment: true },
  });

  if (!accord) throw new Error("ACCORD_NOT_FOUND");
  if (accord.initiateurId !== lenderUserId) throw new Error("NOT_CREDITOR");
  if (!isNotarialWalletAccord(accord)) throw new Error("NOT_WALLET_ACCORD");

  await executeWalletTransfer(accordId);
  return finalizeHonoredAccord(accordId, lenderUserId, false);
}

export async function executeScheduledRepayment(accordId: string) {
  const accord = await prisma.accord.findUnique({
    where: { id: accordId },
    include: { destinataire: true, fulfillment: true },
  });

  if (!accord || accord.repaymentMode !== "SCHEDULED_DEBIT") {
    throw new Error("ACCORD_NOT_ELIGIBLE");
  }

  if (!["ACTIVE", "ESCROW_FUNDED", "OVERDUE"].includes(accord.statut)) {
    throw new Error("ACCORD_NOT_ELIGIBLE");
  }

  if (accord.fulfillment?.status === "CONFIRMED" || accord.statut === "HONORED") {
    return { status: "already_honored" as const };
  }

  await ensureFulfillmentRecord(accordId);
  const now = new Date();
  const amount = Number(accord.montant);

  if (!accord.destinataire) throw new Error("ACCORD_NOT_ELIGIBLE");

  await prisma.accordFulfillment.upsert({
    where: { accordId },
    create: {
      accordId,
      status: "DECLARED",
      amountDeclared: amount,
      paidAt: now,
      paymentMethod: "OTHER",
      reference: `ZP-AUTO-${accord.reference}`,
      declaredName: accord.destinataire.name ?? accord.destinataireNom,
      declaredEmail: accord.destinataire.email,
      declaredAt: now,
    },
    update: {
      status: "DECLARED",
      amountDeclared: amount,
      paidAt: now,
      paymentMethod: "OTHER",
      reference: `ZP-AUTO-${accord.reference}`,
      declaredName: accord.destinataire.name ?? accord.destinataireNom,
      declaredEmail: accord.destinataire.email,
      declaredAt: now,
    },
  });

  try {
    await executeWalletTransfer(accordId);
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_BALANCE") {
      return { status: "insufficient_balance" as const };
    }
    throw e;
  }

  await finalizeHonoredAccord(accordId, accord.initiateurId, true);
  return { status: "honored" as const };
}

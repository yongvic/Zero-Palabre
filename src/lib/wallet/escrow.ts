import { prisma } from "@/lib/prisma";
import { getOrCreateWallet } from "./ledger";

/** Transfert prêt : prêteur → emprunteur via escrow plateforme (double écriture). */
export async function fundLoanFromEscrow(accordId: string) {
  const accord = await prisma.accord.findUnique({
    where: { id: accordId },
    include: { initiateur: true, destinataire: true },
  });

  if (!accord?.montant || !accord.destinataireId) {
    throw new Error("Accord non éligible au financement");
  }

  const amount = Number(accord.montant);
  if (amount <= 0) throw new Error("Montant invalide");

  const lenderWallet = await getOrCreateWallet(accord.initiateurId);
  const borrowerWallet = await getOrCreateWallet(accord.destinataireId);

  if (lenderWallet.balanceAvailable.lessThan(amount)) {
    throw new Error("Solde insuffisant sur le portefeuille du prêteur");
  }

  return prisma.$transaction(async (tx) => {
    const lender = await tx.wallet.findUniqueOrThrow({ where: { id: lenderWallet.id } });
    const borrower = await tx.wallet.findUniqueOrThrow({ where: { id: borrowerWallet.id } });

    const lenderAfter = lender.balanceAvailable.sub(amount);
    const borrowerAfter = borrower.balanceAvailable.add(amount);

    await tx.wallet.update({
      where: { id: lender.id },
      data: { balanceAvailable: lenderAfter },
    });
    await tx.wallet.update({
      where: { id: borrower.id },
      data: { balanceAvailable: borrowerAfter },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: lender.id,
        type: "ESCROW_LOCK",
        amount,
        balanceAfter: lenderAfter,
        label: `Prêt accord ${accord.reference}`,
        accordId,
        status: "COMPLETED",
      },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: borrower.id,
        type: "TRANSFER_IN",
        amount,
        balanceAfter: borrowerAfter,
        label: `Réception prêt ${accord.reference}`,
        accordId,
        status: "COMPLETED",
      },
    });

    await tx.accord.update({
      where: { id: accordId },
      data: { statut: "ESCROW_FUNDED" },
    });

    await tx.accordEvent.create({
      data: { accordId, type: "ESCROW_FUNDED", metadata: { amount } },
    });

    return { lenderAfter: Number(lenderAfter), borrowerAfter: Number(borrowerAfter) };
  });
}

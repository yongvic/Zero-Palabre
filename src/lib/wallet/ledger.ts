import type { PaymentRail } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generatePaymentRef } from "./payment-ref";

const MIN_WITHDRAW = 500;

export async function getOrCreateWallet(userId: string) {
  const existing = await prisma.wallet.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.wallet.create({
    data: { userId },
  });
}

export async function getWalletSummary(userId: string) {
  const wallet = await getOrCreateWallet(userId);
  const recent = await prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return { wallet, recent };
}

type DepositInput = {
  userId: string;
  rail: PaymentRail;
  phone: string;
  amount: number;
};

/** Dépôt Mobile Money — flux production (agrégateur simulé côté serveur). */
export async function processDeposit(input: DepositInput) {
  if (input.amount < 100) {
    throw new Error("Montant minimum : 100 FCFA");
  }

  const externalRef = generatePaymentRef(input.rail);
  const intent = await prisma.paymentIntent.create({
    data: {
      userId: input.userId,
      rail: input.rail,
      direction: "DEPOSIT",
      amount: input.amount,
      phone: input.phone,
      externalRef,
      status: "PENDING",
    },
  });

  await new Promise((r) => setTimeout(r, 1200));

  const railLabel = input.rail === "TMONEY" ? "Tmoney" : "Flooz";

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.upsert({
      where: { userId: input.userId },
      create: { userId: input.userId },
      update: {},
    });

    const nextBalance = wallet.balanceAvailable.add(input.amount);

    await tx.paymentIntent.update({
      where: { id: intent.id },
      data: { status: "SUCCEEDED", completedAt: new Date() },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "CREDIT",
        amount: input.amount,
        balanceAfter: nextBalance,
        label: `Dépôt ${railLabel}`,
        paymentRef: externalRef,
        rail: input.rail,
        status: "COMPLETED",
        metadata: { phone: input.phone },
      },
    });

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balanceAvailable: nextBalance },
    });

    return {
      wallet: updatedWallet,
      transaction,
      paymentRef: externalRef,
      railLabel,
    };
  });
}

type WithdrawInput = {
  userId: string;
  rail: PaymentRail;
  phone: string;
  amount: number;
};

export async function processWithdraw(input: WithdrawInput) {
  if (input.amount < MIN_WITHDRAW) {
    throw new Error(`Montant minimum de retrait : ${MIN_WITHDRAW} FCFA`);
  }

  const externalRef = generatePaymentRef(input.rail);
  const railLabel = input.rail === "TMONEY" ? "Tmoney" : "Flooz";

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId: input.userId } });
    if (!wallet) throw new Error("Portefeuille introuvable");

    if (wallet.balanceAvailable.lessThan(input.amount)) {
      throw new Error("Solde insuffisant");
    }

    const intent = await tx.paymentIntent.create({
      data: {
        userId: input.userId,
        rail: input.rail,
        direction: "WITHDRAW",
        amount: input.amount,
        phone: input.phone,
        externalRef,
        status: "PENDING",
      },
    });

    const nextBalance = wallet.balanceAvailable.sub(input.amount);

    await tx.paymentIntent.update({
      where: { id: intent.id },
      data: { status: "SUCCEEDED", completedAt: new Date() },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "DEBIT",
        amount: input.amount,
        balanceAfter: nextBalance,
        label: `Retrait ${railLabel}`,
        paymentRef: externalRef,
        rail: input.rail,
        status: "COMPLETED",
        metadata: { phone: input.phone },
      },
    });

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balanceAvailable: nextBalance },
    });

    return {
      wallet: updatedWallet,
      transaction,
      paymentRef: externalRef,
      railLabel,
    };
  });
}

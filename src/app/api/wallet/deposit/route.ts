import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { processDeposit } from "@/lib/wallet/ledger";
import { walletDepositSchema } from "@/lib/validations/wallet";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = walletDepositSchema.parse(body);
    const result = await processDeposit({
      userId: session.user.id,
      ...data,
    });

    return NextResponse.json({
      data: {
        balanceAvailable: Number(result.wallet.balanceAvailable),
        paymentRef: result.paymentRef,
        railLabel: result.railLabel,
        transactionId: result.transaction.id,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: err.errors[0]?.message ?? "Données invalides" } },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Erreur de dépôt";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}

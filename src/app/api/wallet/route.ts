import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWalletSummary } from "@/lib/wallet/ledger";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  const { wallet, recent } = await getWalletSummary(session.user.id);

  return NextResponse.json({
    data: {
      balanceAvailable: Number(wallet.balanceAvailable),
      balanceEscrow: Number(wallet.balanceEscrow),
      currency: wallet.currency,
      transactions: recent.map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        balanceAfter: Number(t.balanceAfter),
        label: t.label,
        paymentRef: t.paymentRef,
        rail: t.rail,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
    },
  });
}

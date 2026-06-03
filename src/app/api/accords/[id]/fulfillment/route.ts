import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureFulfillmentRecord } from "@/lib/fulfillment/record";
import { daysUntilDue, daysOverdue } from "@/lib/fulfillment/schedule";
import { PAYMENT_METHOD_LABELS, REPAYMENT_MODE_LABELS } from "@/lib/constants";
import { trustLevelLabel } from "@/lib/fulfillment/trust";
import { isNotarialWalletAccord } from "@/lib/notarial/is-notarial-accord";
import { getOrCreateWallet } from "@/lib/wallet/ledger";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  const accord = await prisma.accord.findFirst({
    where: {
      id: params.id,
      OR: [
        { initiateurId: session.user.id },
        { destinataireId: session.user.id },
      ],
    },
    include: { fulfillment: true, initiateur: { select: { name: true, email: true } } },
  });

  if (!accord) {
    return NextResponse.json({ error: { message: "Accord introuvable" } }, { status: 404 });
  }

  if (accord.montant == null) {
    return NextResponse.json({ data: { eligible: false } });
  }

  await ensureFulfillmentRecord(accord.id);
  const fulfillment = await prisma.accordFulfillment.findUnique({
    where: { accordId: accord.id },
    include: { confirmedBy: { select: { name: true, email: true } } },
  });

  const isCreditor = accord.initiateurId === session.user.id;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const notarialWallet = isNotarialWalletAccord(accord);

  let walletBalance: number | null = null;
  if (notarialWallet && session.user.id === accord.destinataireId) {
    const wallet = await getOrCreateWallet(session.user.id);
    walletBalance = Number(wallet.balanceAvailable);
  }

  return NextResponse.json({
    data: {
      eligible: true,
      isCreditor,
      notarialWallet,
      repaymentMode: accord.repaymentMode,
      repaymentModeLabel: accord.repaymentMode
        ? REPAYMENT_MODE_LABELS[accord.repaymentMode]
        : null,
      walletBalance,
      montantRequired: Number(accord.montant),
      accordStatut: accord.statut,
      montant: Number(accord.montant),
      dateEcheance: accord.dateEcheance?.toISOString() ?? null,
      daysUntilDue: accord.dateEcheance ? daysUntilDue(accord.dateEcheance) : null,
      daysOverdue: accord.dateEcheance ? daysOverdue(accord.dateEcheance) : 0,
      executerUrl: fulfillment
        ? `${baseUrl}/executer/${fulfillment.fulfillToken}`
        : null,
      fulfillment: fulfillment
        ? {
            status: fulfillment.status,
            fulfillToken: fulfillment.fulfillToken,
            amountDeclared: fulfillment.amountDeclared
              ? Number(fulfillment.amountDeclared)
              : null,
            paidAt: fulfillment.paidAt?.toISOString() ?? null,
            paymentMethod: fulfillment.paymentMethod,
            paymentMethodLabel: fulfillment.paymentMethod
              ? PAYMENT_METHOD_LABELS[fulfillment.paymentMethod]
              : null,
            reference: fulfillment.reference,
            hasProof: Boolean(fulfillment.proofData),
            proofUrl: fulfillment.proofData,
            declaredName: fulfillment.declaredName,
            declaredEmail: fulfillment.declaredEmail,
            declaredAt: fulfillment.declaredAt?.toISOString() ?? null,
            confirmedAt: fulfillment.confirmedAt?.toISOString() ?? null,
            fulfillmentHash: fulfillment.fulfillmentHash,
            trustLevel: fulfillment.trustLevel,
            trustLabel: trustLevelLabel(fulfillment.trustLevel),
            rejectReason: fulfillment.rejectReason,
          }
        : null,
    },
  });
}

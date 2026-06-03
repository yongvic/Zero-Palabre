import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { confirmFulfillment } from "@/lib/fulfillment/confirm";
import { confirmWalletRepayment } from "@/lib/wallet/repayment";
import { prisma } from "@/lib/prisma";
import { isNotarialWalletAccord } from "@/lib/notarial/is-notarial-accord";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  try {
    const accord = await prisma.accord.findUnique({ where: { id: params.id } });
    const result = accord && isNotarialWalletAccord(accord)
      ? await confirmWalletRepayment(params.id, session.user.id)
      : await confirmFulfillment(params.id, session.user.id);

    return NextResponse.json({ data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const errors: Record<string, string> = {
      ACCORD_NOT_FOUND: "Accord introuvable.",
      NOT_CREDITOR: "Seul le créancier peut confirmer.",
      NOT_DECLARED: "Aucune déclaration en attente.",
      INCOMPLETE_DECLARATION: "Déclaration incomplète.",
      NOT_WALLET_ACCORD: "Accord non éligible au portefeuille.",
      INSUFFICIENT_BALANCE: "Solde emprunteur insuffisant — remboursement impossible.",
    };
    return NextResponse.json(
      { error: { message: errors[msg] ?? "Confirmation impossible." } },
      { status: 400 }
    );
  }
}

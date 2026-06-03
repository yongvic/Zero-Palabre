import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { declareWalletRepayment } from "@/lib/wallet/repayment";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  try {
    await declareWalletRepayment(params.id, session.user.id);
    return NextResponse.json({ data: { status: "DECLARED" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const errors: Record<string, string> = {
      ACCORD_NOT_ELIGIBLE: "Accord non éligible au remboursement portefeuille.",
      INSUFFICIENT_BALANCE: "Solde portefeuille insuffisant pour ce remboursement.",
      ALREADY_DECLARED: "Une déclaration est déjà en attente.",
    };
    return NextResponse.json(
      { error: { message: errors[msg] ?? "Déclaration impossible." } },
      { status: 400 }
    );
  }
}

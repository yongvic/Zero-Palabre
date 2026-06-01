import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { confirmFulfillment } from "@/lib/fulfillment/confirm";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  try {
    const result = await confirmFulfillment(params.id, session.user.id);
    return NextResponse.json({ data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const errors: Record<string, string> = {
      ACCORD_NOT_FOUND: "Accord introuvable.",
      NOT_CREDITOR: "Seul le créancier peut confirmer.",
      NOT_DECLARED: "Aucune déclaration en attente.",
      INCOMPLETE_DECLARATION: "Déclaration incomplète.",
    };
    return NextResponse.json(
      { error: { message: errors[msg] ?? "Confirmation impossible." } },
      { status: 400 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rejectFulfillmentSchema } from "@/lib/fulfillment/types";
import { rejectFulfillment } from "@/lib/fulfillment/reject";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  try {
    const { reason } = rejectFulfillmentSchema.parse(await req.json());
    const result = await rejectFulfillment(params.id, session.user.id, reason);
    return NextResponse.json({ data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const errors: Record<string, string> = {
      ACCORD_NOT_FOUND: "Accord introuvable.",
      NOT_CREDITOR: "Seul le créancier peut refuser.",
      NOT_DECLARED: "Aucune déclaration en attente.",
    };
    return NextResponse.json(
      { error: { message: errors[msg] ?? "Refus impossible." } },
      { status: 400 }
    );
  }
}

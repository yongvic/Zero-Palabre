import { NextResponse } from "next/server";
import { declareFulfillmentSchema } from "@/lib/fulfillment/types";
import { declareFulfillment } from "@/lib/fulfillment/declare";
import { getFulfillmentByToken } from "@/lib/fulfillment/record";

export async function POST(
  req: Request,
  { params }: { params: { fulfillToken: string } }
) {
  try {
    const row = await getFulfillmentByToken(params.fulfillToken);
    if (!row) {
      return NextResponse.json({ error: { message: "Lien introuvable" } }, { status: 404 });
    }

    if (row.status === "DECLARED") {
      return NextResponse.json(
        { error: { message: "Une déclaration est déjà en attente de confirmation" } },
        { status: 409 }
      );
    }

    const body = declareFulfillmentSchema.parse(await req.json());
    const fulfillment = await declareFulfillment(row.accordId, body);

    return NextResponse.json({ data: { status: fulfillment.status } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const errors: Record<string, string> = {
      ACCORD_NOT_FOUND: "Accord introuvable.",
      ACCORD_NOT_ELIGIBLE: "Accord non éligible.",
      NO_AMOUNT: "Cet accord n'a pas de montant à rembourser.",
      AMOUNT_MISMATCH: "Le montant doit correspondre exactement à celui de l'accord.",
      EMAIL_MISMATCH: "L'email doit correspondre à l'invitation.",
      INVALID_DATE: "Date de paiement invalide.",
    };
    return NextResponse.json(
      { error: { message: errors[msg] ?? "Déclaration impossible." } },
      { status: 400 }
    );
  }
}

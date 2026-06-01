import { NextResponse } from "next/server";
import { getFulfillmentByToken } from "@/lib/fulfillment/record";
import { formatMontant } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: { fulfillToken: string } }
) {
  const row = await getFulfillmentByToken(params.fulfillToken);
  if (!row) {
    return NextResponse.json({ error: { message: "Lien introuvable" } }, { status: 404 });
  }

  const { accord } = row;
  if (!["ACCEPTED", "OVERDUE"].includes(accord.statut)) {
    return NextResponse.json(
      { error: { message: "Cet accord n'accepte plus de déclaration" } },
      { status: 409 }
    );
  }

  if (row.status === "CONFIRMED" || accord.statut === "HONORED") {
    return NextResponse.json(
      { error: { message: "Cet accord est déjà honoré" } },
      { status: 409 }
    );
  }

  return NextResponse.json({
    data: {
      fulfillToken: row.fulfillToken,
      fulfillmentStatus: row.status,
      accord: {
        reference: accord.reference,
        titre: accord.titre,
        montant: accord.montant ? Number(accord.montant) : null,
        montantLabel: formatMontant(
          accord.montant ? Number(accord.montant) : null,
          accord.devise
        ),
        devise: accord.devise,
        dateEcheance: accord.dateEcheance?.toISOString() ?? null,
        destinataireNom: accord.destinataireNom,
        destinataireEmail: accord.destinataireEmail,
        creditorName: accord.initiateur.name ?? "Créancier",
        statut: accord.statut,
        publicToken: accord.publicToken,
      },
    },
  });
}

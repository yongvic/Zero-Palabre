import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { FulfillmentAttestationPdf } from "@/components/pdf/fulfillment-attestation";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatDate, formatMontantPdf } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const accord = await prisma.accord.findUnique({
    where: { id: params.id },
    include: { initiateur: true, fulfillment: true },
  });

  if (!accord?.fulfillment || accord.fulfillment.status !== "CONFIRMED") {
    return NextResponse.json({ error: { message: "Attestation non disponible" } }, { status: 404 });
  }

  const f = accord.fulfillment;
  if (
    !f.fulfillmentHash ||
    !f.amountDeclared ||
    !f.paidAt ||
    !f.paymentMethod ||
    !f.declaredName ||
    !f.declaredEmail ||
    !f.declaredAt ||
    !f.confirmedAt ||
    !accord.contentHash
  ) {
    return NextResponse.json({ error: { message: "Données incomplètes" } }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    FulfillmentAttestationPdf({
      reference: accord.reference,
      titre: accord.titre,
      contentHash: accord.contentHash,
      amountDeclared: formatMontantPdf(Number(f.amountDeclared), accord.devise),
      paidAt: formatDate(f.paidAt),
      paymentMethod: PAYMENT_METHOD_LABELS[f.paymentMethod] ?? f.paymentMethod,
      referenceTx: f.reference,
      declaredName: f.declaredName,
      declaredEmail: f.declaredEmail,
      declaredAt: formatDate(f.declaredAt),
      confirmedAt: formatDate(f.confirmedAt),
      creditorName: accord.initiateur.name ?? "Créancier",
      creditorEmail: accord.initiateur.email,
      fulfillmentHash: f.fulfillmentHash,
      hasProof: Boolean(f.proofData),
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="attestation-${accord.reference}.pdf"`,
    },
  });
}

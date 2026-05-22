import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateAccordPdfBuffer } from "@/lib/generate-accord-pdf";
import { ACCORD_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime, formatMontantPdf } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const accord = await prisma.accord.findFirst({
    where: {
      id: params.id,
      OR: [
        { initiateurId: session.user.id },
        { destinataireId: session.user.id },
      ],
      statut: "ACCEPTED",
    },
    include: { initiateur: true },
  });

  if (!accord || !accord.contentHash || !accord.validatedAt) {
    return NextResponse.json({ error: "PDF non disponible" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const buffer = await generateAccordPdfBuffer({
    reference: accord.reference,
    titre: accord.titre,
    type: ACCORD_TYPE_LABELS[accord.type] ?? accord.type,
    description: accord.description,
    initiateurName: accord.initiateur.name ?? "—",
    initiateurEmail: accord.initiateur.email,
    destinataireNom: accord.destinataireNom,
    destinataireEmail: accord.destinataireEmail,
    montant: accord.montant
      ? formatMontantPdf(Number(accord.montant), accord.devise)
      : undefined,
    devise: accord.devise,
    dateEcheance: accord.dateEcheance
      ? formatDate(accord.dateEcheance)
      : undefined,
    validatedAt: formatDateTime(accord.validatedAt),
    contentHash: accord.contentHash,
    verifyUrl: `${baseUrl}/verifier/${accord.publicToken}`,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${accord.reference}.pdf"`,
    },
  });
}

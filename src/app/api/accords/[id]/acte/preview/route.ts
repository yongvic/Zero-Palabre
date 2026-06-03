import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildNotarialFields, type NotarialFilledFields } from "@/lib/notarial/build-fields";
import { buildPretActHtml } from "@/lib/notarial/templates/pret-act-prose";
import { getActiveTemplate } from "@/lib/notarial/template";

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
      OR: [{ initiateurId: session.user.id }, { destinataireId: session.user.id }],
      counterpartyUsername: { not: null },
    },
    include: {
      initiateur: true,
      destinataire: true,
      signatures: true,
      notarialAct: true,
    },
  });

  if (!accord?.destinataire) {
    return NextResponse.json({ error: { message: "Acte non disponible" } }, { status: 404 });
  }

  const template = accord.notarialAct
    ? await prisma.notarialTemplate.findUnique({
        where: { id: accord.notarialAct.templateId },
      })
    : await getActiveTemplate(accord.type);

  let fields: NotarialFilledFields;
  if (accord.notarialAct?.filledFields && typeof accord.notarialAct.filledFields === "object") {
    fields = accord.notarialAct.filledFields as NotarialFilledFields;
  } else {
    fields = buildNotarialFields({
      accord,
      initiateur: accord.initiateur,
      contrepartie: accord.destinataire,
      signatures: accord.signatures,
      templateVersion: template?.version ?? "v1.0-pret-togo",
    });
  }

  const html = buildPretActHtml(fields);

  return NextResponse.json({ data: { html, reference: accord.reference } });
}

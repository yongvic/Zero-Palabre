import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { signAccordSchema } from "@/lib/validations/accord";
import { signAsInitiator, signAsCounterparty, expireCounterpartyIfNeeded } from "@/lib/signature/sign";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  await expireCounterpartyIfNeeded(params.id);

  const accord = await prisma.accord.findFirst({
    where: {
      id: params.id,
      OR: [{ initiateurId: session.user.id }, { destinataireId: session.user.id }],
    },
    include: {
      initiateur: { select: { name: true, username: true } },
      destinataire: { select: { name: true, username: true } },
      signatures: true,
      notarialAct: true,
    },
  });

  if (!accord) {
    return NextResponse.json({ error: { message: "Accord introuvable" } }, { status: 404 });
  }

  const role =
    accord.initiateurId === session.user.id
      ? "INITIATOR"
      : accord.destinataireId === session.user.id
        ? "COUNTERPARTY"
        : null;

  return NextResponse.json({
    data: {
      id: accord.id,
      reference: accord.reference,
      titre: accord.titre,
      statut: accord.statut,
      type: accord.type,
      signatureExpiresAt: accord.signatureExpiresAt?.toISOString() ?? null,
      role,
      signatures: accord.signatures,
      hasNotarialAct: !!accord.notarialAct,
    },
  });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { signedName } = signAccordSchema.parse(body);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    const accord = await prisma.accord.findFirst({
      where: {
        id: params.id,
        OR: [{ initiateurId: session.user.id }, { destinataireId: session.user.id }],
      },
    });

    if (!accord) {
      return NextResponse.json({ error: { message: "Accord introuvable" } }, { status: 404 });
    }

    if (accord.statut === "AWAITING_INITIATOR_SIGN" && accord.initiateurId === session.user.id) {
      const result = await signAsInitiator(params.id, session.user.id, signedName, ip);
      return NextResponse.json({ data: { statut: "AWAITING_COUNTERPARTY_SIGN", ...result } });
    }

    if (accord.statut === "AWAITING_COUNTERPARTY_SIGN" && accord.destinataireId === session.user.id) {
      await signAsCounterparty(params.id, session.user.id, signedName, ip);
      return NextResponse.json({ data: { statut: "ESCROW_FUNDED" } });
    }

    return NextResponse.json({ error: { message: "Signature non disponible pour cet accord" } }, { status: 400 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: e.errors[0]?.message ?? "Données invalides" } },
        { status: 400 }
      );
    }
    const message = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}

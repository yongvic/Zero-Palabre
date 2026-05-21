import { NextResponse } from "next/server";
import { validateAccordSchema } from "@/lib/validations/accord";
import { prisma } from "@/lib/prisma";
import { hashAccordContent } from "@/lib/accord-hash";
import { updateReliabilityScore } from "@/lib/reliability";
import { accordValidatedEmail } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/resend";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { action, commentaire } = validateAccordSchema.parse(body);

    const accord = await prisma.accord.findUnique({
      where: { publicToken: params.id },
      include: { initiateur: true },
    });

    if (!accord) {
      return NextResponse.json({ error: { message: "Accord introuvable" } }, { status: 404 });
    }

    if (["ACCEPTED", "REJECTED"].includes(accord.statut)) {
      return NextResponse.json(
        { error: { message: "Cet accord a déjà été traité" } },
        { status: 409 }
      );
    }

    if (accord.inviteExpiresAt && accord.inviteExpiresAt < new Date()) {
      await prisma.accord.update({
        where: { id: accord.id },
        data: { statut: "EXPIRED" },
      });
      return NextResponse.json({ error: { message: "Lien expiré" } }, { status: 410 });
    }

    if (action === "reject") {
      const updated = await prisma.accord.update({
        where: { id: accord.id },
        data: {
          statut: "REJECTED",
          commentaireRefus: commentaire,
        },
      });
      await prisma.accordEvent.create({
        data: { accordId: accord.id, type: "REJECTED", metadata: { commentaire } },
      });
      return NextResponse.json({ data: updated });
    }

    const validatedAt = new Date();
    const contentHash = hashAccordContent({
      ...accord,
      validatedAt,
    });

    const updated = await prisma.accord.update({
      where: { id: accord.id },
      data: {
        statut: "ACCEPTED",
        validatedAt,
        contentHash,
      },
    });

    await prisma.accordEvent.create({
      data: { accordId: accord.id, type: "ACCEPTED" },
    });

    await updateReliabilityScore(accord.initiateurId, "ACCEPTED");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    await sendTransactionalEmail({
      to: accord.initiateur.email,
      subject: `Accord validé : ${accord.titre}`,
      html: accordValidatedEmail({
        titre: accord.titre,
        reference: accord.reference,
      }),
    });

    return NextResponse.json({
      data: updated,
      verifyUrl: `${baseUrl}/verifier/${accord.publicToken}`,
    });
  } catch {
    return NextResponse.json({ error: { message: "Requête invalide" } }, { status: 400 });
  }
}

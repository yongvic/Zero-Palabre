import { NextResponse } from "next/server";
import { validateAccordSchema } from "@/lib/validations/accord";
import { prisma } from "@/lib/prisma";
import { hashAccordContent } from "@/lib/accord-hash";
import { updateReliabilityScore } from "@/lib/reliability";
import { accordValidatedEmail } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/resend";
import {
  assertVoiceSessionReady,
  markVoiceSessionApplied,
} from "@/lib/voice-signature/session";
import type { VoiceExtraction } from "@/lib/voice-signature/types";
import type { Prisma } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { action, commentaire, voiceSessionId } = validateAccordSchema.parse(body);

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

    let voiceMeta: Prisma.InputJsonValue | undefined;
    let voiceSummaryFr: string | undefined;

    if (voiceSessionId) {
      try {
        const session = await assertVoiceSessionReady(
          voiceSessionId,
          accord.id,
          action === "accept" ? "accept" : "reject"
        );
        const extracted = session.extracted as VoiceExtraction | null;
        voiceSummaryFr = extracted?.summaryFr ?? undefined;
        voiceMeta = {
          voiceSessionId: session.sessionId,
          signerName: extracted?.signerName ?? null,
          summaryFr: extracted?.summaryFr ?? null,
          transcripts: session.transcripts,
          audioUrls: session.audioUrls,
        } as Prisma.InputJsonValue;
        await markVoiceSessionApplied(voiceSessionId);
      } catch (e) {
        const code = e instanceof Error ? e.message : "";
        const messages: Record<string, string> = {
          SESSION_NOT_FOUND: "Session vocale introuvable.",
          SESSION_EXPIRED: "Session vocale expirée. Recommencez la signature.",
          SESSION_NOT_READY: "Informations vocales incomplètes. Complétez les champs demandés.",
          SESSION_INTENT_MISMATCH: "La session vocale ne correspond pas à cette action.",
        };
        return NextResponse.json(
          { error: { message: messages[code] ?? "Signature vocale invalide." } },
          { status: 400 }
        );
      }
    }

    if (action === "reject") {
      const finalComment = commentaire ?? voiceSummaryFr ?? "Accord refusé.";

      const updated = await prisma.accord.update({
        where: { id: accord.id },
        data: {
          statut: "REJECTED",
          commentaireRefus: finalComment,
        },
      });
      await prisma.accordEvent.create({
        data: {
          accordId: accord.id,
          type: "REJECTED",
          metadata: { commentaire: finalComment, voice: voiceMeta } as Prisma.InputJsonValue,
        },
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
      data: {
        accordId: accord.id,
        type: "ACCEPTED",
        metadata: voiceMeta
          ? ({ voice: voiceMeta } as Prisma.InputJsonValue)
          : undefined,
      },
    });

    if (voiceSessionId) {
      await prisma.accordEvent.create({
        data: {
          accordId: accord.id,
          type: "VOICE_SIGNATURE",
          metadata: voiceMeta,
        },
      });
    }

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

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { findAccordForParty } from "@/lib/party-session/accord-route";
import {
  getPartySessionBySessionId,
  markPartySessionRejected,
} from "@/lib/party-session/session";
import type { Prisma } from "@prisma/client";

const bodySchema = z.object({
  sessionId: z.string().min(1),
  commentaire: z.string().min(5).max(1000),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await findAccordForParty(params.id);
    if (!result?.accord || result.error) {
      return NextResponse.json(
        { error: { message: "Accord non disponible" } },
        { status: 409 }
      );
    }

    const { sessionId, commentaire } = bodySchema.parse(await req.json());

    let sessionMeta: Prisma.InputJsonValue | undefined;
    try {
      const session = await getPartySessionBySessionId(sessionId, result.accord.id);
      if (session) {
        await markPartySessionRejected(sessionId);
        sessionMeta = {
          sessionId,
          currentStep: session.currentStep,
          fieldResponses: session.fieldResponses,
        };
      }
    } catch {
      /* session optionnelle */
    }

    const updated = await prisma.accord.update({
      where: { id: result.accord.id },
      data: {
        statut: "REJECTED",
        commentaireRefus: commentaire,
      },
    });

    await prisma.accordEvent.create({
      data: {
        accordId: result.accord.id,
        type: "REJECTED",
        metadata: { commentaire, partySession: sessionMeta },
      },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: { message: "Refus invalide" } }, { status: 400 });
  }
}

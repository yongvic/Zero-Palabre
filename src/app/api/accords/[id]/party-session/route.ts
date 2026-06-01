import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { findAccordForParty } from "@/lib/party-session/accord-route";
import { accordToSnapshot, buildTermFields } from "@/lib/party-session/terms";
import {
  getOrCreatePartySession,
  sessionToClient,
  getPartySessionBySessionId,
} from "@/lib/party-session/session";
import { fieldResponseSchema } from "@/lib/party-session/types";
import type { Prisma } from "@prisma/client";

const patchSchema = z.object({
  currentStep: z.number().int().min(1).max(6).optional(),
  confirmedName: z.string().min(2).max(80).optional(),
  confirmedEmail: z.string().email().optional(),
  fieldResponse: z
    .object({
      key: z.string(),
      action: z.enum(["accepted", "amended"]),
      proposedValue: z.string().optional(),
      originalValue: z.string(),
    })
    .optional(),
  signatureName: z.string().min(2).max(80).optional(),
  cguAccepted: z.boolean().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await findAccordForParty(params.id);
    if (!result) {
      return NextResponse.json({ error: { message: "Accord introuvable" } }, { status: 404 });
    }
    if (result.error === "EXPIRED") {
      return NextResponse.json({ error: { message: "Lien expiré" } }, { status: 410 });
    }
    if (result.error === "ALREADY_PROCESSED") {
      return NextResponse.json(
        { error: { message: "Cet accord a déjà été traité" } },
        { status: 409 }
      );
    }

    const expiresAt =
      result.accord.inviteExpiresAt ??
      new Date(Date.now() + 72 * 60 * 60 * 1000);

    const session = await getOrCreatePartySession(result.accord.id, expiresAt);
    const snapshot = accordToSnapshot(result.accord);
    const termFields = buildTermFields(snapshot);

    return NextResponse.json({
      data: {
        session: sessionToClient(session),
        accord: snapshot,
        termFields,
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "SESSION_EXPIRED") {
      return NextResponse.json(
        { error: { message: "Session expirée. Rechargez la page." } },
        { status: 410 }
      );
    }
    console.error("[party-session GET]", e);
    return NextResponse.json({ error: { message: "Erreur serveur" } }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await findAccordForParty(params.id);
    if (!result?.accord || result.error) {
      const status = result?.error === "EXPIRED" ? 410 : result ? 409 : 404;
      return NextResponse.json(
        { error: { message: "Accord non disponible" } },
        { status }
      );
    }

    const body = patchSchema.parse(await req.json());
    const expiresAt =
      result.accord.inviteExpiresAt ??
      new Date(Date.now() + 72 * 60 * 60 * 1000);

    let session = await getOrCreatePartySession(result.accord.id, expiresAt);

    const data: Prisma.AccordPartySessionUpdateInput = {};

    if (body.currentStep !== undefined) data.currentStep = body.currentStep;
    if (body.confirmedName !== undefined) data.confirmedName = body.confirmedName;
    if (body.confirmedEmail !== undefined) data.confirmedEmail = body.confirmedEmail;
    if (body.signatureName !== undefined) data.signatureName = body.signatureName;
    if (body.cguAccepted === true) data.cguAcceptedAt = new Date();

    if (body.fieldResponse) {
      const existing =
        session.fieldResponses && typeof session.fieldResponses === "object"
          ? { ...(session.fieldResponses as Record<string, unknown>) }
          : {};

      const entry = fieldResponseSchema.parse({
        action: body.fieldResponse.action,
        originalValue: body.fieldResponse.originalValue,
        proposedValue:
          body.fieldResponse.action === "amended"
            ? body.fieldResponse.proposedValue ?? body.fieldResponse.originalValue
            : undefined,
        at: new Date().toISOString(),
      });

      existing[body.fieldResponse.key] = entry;
      data.fieldResponses = existing as Prisma.InputJsonValue;
    }

    session = await prisma.accordPartySession.update({
      where: { id: session.id },
      data,
    });

    if (body.currentStep === 2) {
      await prisma.accordEvent.create({
        data: {
          accordId: result.accord.id,
          type: "PARTY_SESSION_STARTED",
          metadata: { sessionId: session.sessionId },
        },
      });
    }

    const snapshot = accordToSnapshot(result.accord);
    return NextResponse.json({
      data: {
        session: sessionToClient(session),
        termFields: buildTermFields(snapshot),
      },
    });
  } catch (e) {
    console.error("[party-session PATCH]", e);
    return NextResponse.json({ error: { message: "Mise à jour impossible" } }, { status: 400 });
  }
}

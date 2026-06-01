import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { FieldResponses, PartySessionClient } from "./types";
import { fieldResponseSchema } from "./types";
import { hasAmendments } from "./terms";

function parseFieldResponses(raw: unknown): FieldResponses {
  if (!raw || typeof raw !== "object") return {};
  const out: FieldResponses = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const parsed = fieldResponseSchema.safeParse(val);
    if (parsed.success) out[key] = parsed.data;
  }
  return out;
}

export function sessionToClient(session: {
  sessionId: string;
  status: string;
  currentStep: number;
  confirmedName: string | null;
  confirmedEmail: string | null;
  fieldResponses: unknown;
  signatureName: string | null;
  cguAcceptedAt: Date | null;
}): PartySessionClient {
  const fieldResponses = parseFieldResponses(session.fieldResponses);
  return {
    sessionId: session.sessionId,
    status: session.status,
    currentStep: session.currentStep,
    confirmedName: session.confirmedName,
    confirmedEmail: session.confirmedEmail,
    fieldResponses,
    signatureName: session.signatureName,
    hasAmendments: hasAmendments(fieldResponses),
    cguAccepted: Boolean(session.cguAcceptedAt),
  };
}

export async function getOrCreatePartySession(accordId: string, expiresAt: Date) {
  const existing = await prisma.accordPartySession.findFirst({
    where: {
      accordId,
      status: "IN_PROGRESS",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) return existing;

  return prisma.accordPartySession.create({
    data: {
      accordId,
      expiresAt,
      status: "IN_PROGRESS",
      currentStep: 1,
    },
  });
}

export async function getPartySessionBySessionId(sessionId: string, accordId: string) {
  const session = await prisma.accordPartySession.findUnique({
    where: { sessionId },
  });
  if (!session || session.accordId !== accordId) return null;
  if (session.expiresAt < new Date() && session.status === "IN_PROGRESS") {
    await prisma.accordPartySession.update({
      where: { id: session.id },
      data: { status: "EXPIRED" },
    });
    throw new Error("SESSION_EXPIRED");
  }
  return session;
}

export async function assertPartySessionCompletable(
  sessionId: string,
  accordId: string,
  termKeys: string[]
) {
  const session = await getPartySessionBySessionId(sessionId, accordId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.status !== "IN_PROGRESS") throw new Error("SESSION_NOT_ACTIVE");

  const responses = parseFieldResponses(session.fieldResponses);
  for (const key of termKeys) {
    if (!responses[key]) throw new Error(`TERM_MISSING:${key}`);
  }
  if (!session.confirmedName || !session.confirmedEmail) {
    throw new Error("IDENTITY_INCOMPLETE");
  }
  if (!session.cguAcceptedAt) throw new Error("CGU_NOT_ACCEPTED");
  if (!session.signatureName?.trim()) throw new Error("SIGNATURE_MISSING");

  return { session, fieldResponses: responses };
}

export async function markPartySessionCompleted(sessionId: string) {
  await prisma.accordPartySession.update({
    where: { sessionId },
    data: { status: "COMPLETED", consentAt: new Date() },
  });
}

export async function markPartySessionRejected(sessionId: string) {
  await prisma.accordPartySession.update({
    where: { sessionId },
    data: { status: "REJECTED" },
  });
}

export function fieldResponsesToJson(responses: FieldResponses): Prisma.InputJsonValue {
  return responses as Prisma.InputJsonValue;
}

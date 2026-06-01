import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { addMinutes } from "date-fns";
import type { VoiceAccordContext, VoiceExtraction, VoiceMissingField, VoiceSessionPayload } from "./types";
import { evaluateVoiceExtraction } from "./evaluate";
import { extractFromTranscript } from "./extract";

const SESSION_TTL_MINUTES = 45;

function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

export function accordToVoiceContext(accord: {
  reference: string;
  titre: string;
  description: string;
  destinataireNom: string;
  montant: unknown;
  devise: string;
  initiateur: { name: string | null };
}): VoiceAccordContext {
  const montant =
    accord.montant != null
      ? Number(accord.montant).toLocaleString("fr-FR")
      : null;

  return {
    reference: accord.reference,
    titre: accord.titre,
    description: accord.description,
    destinataireNom: accord.destinataireNom,
    initiateurName: accord.initiateur.name ?? "L'initiateur",
    montant,
    devise: accord.devise,
  };
}

export async function getOrCreateVoiceSession(accordId: string, sessionId?: string) {
  const now = new Date();

  if (sessionId) {
    const existing = await prisma.voiceSignatureSession.findUnique({
      where: { sessionId },
    });
    if (existing && existing.accordId === accordId) {
      if (existing.expiresAt < now) {
        await prisma.voiceSignatureSession.update({
          where: { id: existing.id },
          data: { status: "EXPIRED" },
        });
        throw new Error("SESSION_EXPIRED");
      }
      if (existing.status === "APPLIED") {
        throw new Error("SESSION_ALREADY_USED");
      }
      return existing;
    }
  }

  return prisma.voiceSignatureSession.create({
    data: {
      accordId,
      expiresAt: addMinutes(now, SESSION_TTL_MINUTES),
      status: "IN_PROGRESS",
    },
  });
}

export function sessionToPayload(
  session: {
    sessionId: string;
    intent: string | null;
    transcripts: unknown;
    extracted: unknown;
    missingFields: unknown;
    status: string;
  },
  ready: boolean
): VoiceSessionPayload {
  return {
    sessionId: session.sessionId,
    intent: session.intent as "accept" | "reject" | null,
    transcripts: parseJsonArray<string>(session.transcripts),
    extracted: session.extracted as VoiceExtraction | null,
    missingFields: parseJsonArray<VoiceMissingField>(session.missingFields),
    ready,
    summaryFr:
      session.extracted && typeof session.extracted === "object"
        ? ((session.extracted as VoiceExtraction).summaryFr ?? null)
        : null,
  };
}

export async function processVoiceTranscript(params: {
  accordId: string;
  sessionId: string | undefined;
  transcript: string;
  intent: "accept" | "reject";
  context: VoiceAccordContext;
  textAnswers?: Record<string, string>;
}) {
  const trimmed = params.transcript.trim();
  if (trimmed.length < 10) {
    throw new Error("TRANSCRIPT_TOO_SHORT");
  }

  const session = await getOrCreateVoiceSession(params.accordId, params.sessionId);
  const prior = parseJsonArray<string>(session.transcripts);

  let combined = trimmed;
  if (params.textAnswers && Object.keys(params.textAnswers).length > 0) {
    const answers = Object.entries(params.textAnswers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    combined = `${trimmed}\n\nCompléments écrits :\n${answers}`;
  }

  const extraction = await extractFromTranscript(
    combined,
    params.context,
    params.intent,
    prior
  );

  const { missingFields, ready } = evaluateVoiceExtraction(
    extraction,
    params.context,
    params.intent
  );

  const transcripts = [...prior, trimmed];
  const status = ready ? "READY" : "IN_PROGRESS";

  const updated = await prisma.voiceSignatureSession.update({
    where: { id: session.id },
    data: {
      intent: params.intent,
      transcripts: transcripts as Prisma.InputJsonValue,
      extracted: extraction as Prisma.InputJsonValue,
      missingFields: missingFields as Prisma.InputJsonValue,
      status,
    },
  });

  return {
    session: updated,
    payload: sessionToPayload(updated, ready),
    extraction,
  };
}

export async function assertVoiceSessionReady(
  sessionId: string,
  accordId: string,
  expectedIntent: "accept" | "reject"
) {
  const session = await prisma.voiceSignatureSession.findUnique({
    where: { sessionId },
  });

  if (!session || session.accordId !== accordId) {
    throw new Error("SESSION_NOT_FOUND");
  }
  if (session.expiresAt < new Date()) {
    throw new Error("SESSION_EXPIRED");
  }
  if (session.status !== "READY") {
    throw new Error("SESSION_NOT_READY");
  }
  if (session.intent !== expectedIntent) {
    throw new Error("SESSION_INTENT_MISMATCH");
  }

  return session;
}

export async function markVoiceSessionApplied(sessionId: string) {
  await prisma.voiceSignatureSession.update({
    where: { sessionId },
    data: { status: "APPLIED" },
  });
}

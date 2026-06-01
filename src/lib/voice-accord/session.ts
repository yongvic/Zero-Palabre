import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { addMinutes } from "date-fns";
import type { CreateAccordInput } from "@/lib/validations/accord";
import { extractAccordFromTranscript, type InitiateurContext } from "./extract";
import { evaluateAccordDraft, applyTextAnswersToDraft } from "./evaluate";
import type { VoiceAccordDraftPayload, VoiceMissingField } from "./types";
import type { AccordDraftExtraction } from "./types";

const SESSION_TTL_MINUTES = 60;

function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

export async function getOrCreateVoiceAccordDraft(userId: string, sessionId?: string) {
  const now = new Date();

  if (sessionId) {
    const existing = await prisma.voiceAccordDraft.findUnique({
      where: { sessionId },
    });
    if (existing && existing.userId === userId) {
      if (existing.expiresAt < now) {
        await prisma.voiceAccordDraft.update({
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

  return prisma.voiceAccordDraft.create({
    data: {
      userId,
      expiresAt: addMinutes(now, SESSION_TTL_MINUTES),
      status: "IN_PROGRESS",
    },
  });
}

function priorDraftFromSession(extracted: unknown): Partial<CreateAccordInput> {
  if (!extracted || typeof extracted !== "object") return {};
  const o = extracted as Record<string, unknown>;
  const draft: Partial<CreateAccordInput> = {};
  if (o.type && o.type !== "unclear" && typeof o.type === "string") {
    draft.type = o.type as CreateAccordInput["type"];
  }
  if (typeof o.titre === "string") draft.titre = o.titre;
  if (typeof o.destinataireNom === "string") draft.destinataireNom = o.destinataireNom;
  if (typeof o.destinataireEmail === "string") draft.destinataireEmail = o.destinataireEmail;
  if (typeof o.description === "string") draft.description = o.description;
  if (typeof o.montant === "number") draft.montant = o.montant;
  if (o.devise === "FCFA" || o.devise === "EUR" || o.devise === "USD") {
    draft.devise = o.devise;
  }
  if (typeof o.dateEcheance === "string") draft.dateEcheance = o.dateEcheance;
  return draft;
}

export function draftToPayload(
  session: {
    sessionId: string;
    transcripts: unknown;
    extracted: unknown;
    missingFields: unknown;
    status: string;
  },
  draft: Partial<CreateAccordInput>,
  ready: boolean
): VoiceAccordDraftPayload {
  const extraction = session.extracted as AccordDraftExtraction | null;
  return {
    sessionId: session.sessionId,
    draft: draft as Record<string, unknown>,
    missingFields: parseJsonArray<VoiceMissingField>(session.missingFields),
    ready,
    summaryFr: extraction?.summaryFr ?? null,
    transcripts: parseJsonArray<string>(session.transcripts),
  };
}

export async function processVoiceAccordTranscript(params: {
  userId: string;
  sessionId?: string;
  transcript: string;
  initiateur: InitiateurContext;
  textAnswers?: Record<string, string>;
}) {
  const trimmed = params.transcript.trim();
  if (trimmed.length < 15) {
    throw new Error("TRANSCRIPT_TOO_SHORT");
  }

  const session = await getOrCreateVoiceAccordDraft(params.userId, params.sessionId);
  const prior = parseJsonArray<string>(session.transcripts);
  let priorDraft = priorDraftFromSession(session.extracted);
  if (params.textAnswers) {
    priorDraft = applyTextAnswersToDraft(priorDraft, params.textAnswers);
  }

  let combined = trimmed;
  if (params.textAnswers && Object.keys(params.textAnswers).length > 0) {
    const answers = Object.entries(params.textAnswers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    combined = `${trimmed}\n\nCompléments :\n${answers}`;
  }

  const extraction = await extractAccordFromTranscript(
    combined,
    params.initiateur,
    prior
  );

  const { missingFields, ready, draft } = evaluateAccordDraft(extraction, priorDraft);

  const stored = { ...extraction, ...draft };

  const updated = await prisma.voiceAccordDraft.update({
    where: { id: session.id },
    data: {
      transcripts: [...prior, trimmed] as Prisma.InputJsonValue,
      extracted: stored as Prisma.InputJsonValue,
      missingFields: missingFields as Prisma.InputJsonValue,
      status: ready ? "READY" : "IN_PROGRESS",
    },
  });

  return {
    session: updated,
    payload: draftToPayload(updated, draft, ready),
  };
}

export async function markVoiceAccordDraftApplied(sessionId: string, userId: string) {
  const session = await prisma.voiceAccordDraft.findUnique({ where: { sessionId } });
  if (!session || session.userId !== userId) return;
  await prisma.voiceAccordDraft.update({
    where: { sessionId },
    data: { status: "APPLIED" },
  });
}

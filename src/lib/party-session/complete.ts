import { prisma } from "@/lib/prisma";
import { hashAccordContent } from "@/lib/accord-hash";
import { updateReliabilityScore } from "@/lib/reliability";
import { accordValidatedEmail } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/resend";
import type { Prisma } from "@prisma/client";
import {
  assertPartySessionCompletable,
  markPartySessionCompleted,
  fieldResponsesToJson,
} from "./session";

export async function completePartySession(params: {
  sessionId: string;
  accordId: string;
  termKeys: string[];
}) {
  const { session, fieldResponses } = await assertPartySessionCompletable(
    params.sessionId,
    params.accordId,
    params.termKeys
  );

  const accord = await prisma.accord.findUnique({
    where: { id: params.accordId },
    include: { initiateur: true },
  });

  if (!accord) throw new Error("ACCORD_NOT_FOUND");

  const validatedAt = new Date();
  const partyProof = {
    sessionId: session.sessionId,
    confirmedName: session.confirmedName,
    confirmedEmail: session.confirmedEmail,
    signatureName: session.signatureName,
    fieldResponses,
    completedAt: validatedAt.toISOString(),
  };

  const contentHash = hashAccordContent(
    { ...accord, validatedAt },
    partyProof
  );

  const updated = await prisma.accord.update({
    where: { id: accord.id },
    data: {
      statut: "ACCEPTED",
      validatedAt,
      contentHash,
    },
  });

  await markPartySessionCompleted(session.sessionId);

  const events: Prisma.AccordEventCreateManyInput[] = [
    { accordId: accord.id, type: "PARTY_IDENTIFIED", metadata: { name: session.confirmedName, email: session.confirmedEmail } },
    { accordId: accord.id, type: "DOCUMENT_VIEWED" },
  ];

  for (const [key, resp] of Object.entries(fieldResponses)) {
    events.push({
      accordId: accord.id,
      type: resp.action === "amended" ? "TERM_AMENDED" : "TERM_ACK",
      metadata: { field: key, ...resp },
    });
  }

  if (Object.values(fieldResponses).some((r) => r.action === "amended")) {
    events.push({ accordId: accord.id, type: "AMENDMENTS_REVIEWED" });
  }

  events.push(
    { accordId: accord.id, type: "CONSENT_GIVEN" },
    {
      accordId: accord.id,
      type: "SIGNATURE_TYPED",
      metadata: { signatureName: session.signatureName },
    },
    {
      accordId: accord.id,
      type: "PARTY_SESSION_COMPLETED",
      metadata: fieldResponsesToJson(fieldResponses),
    },
    { accordId: accord.id, type: "ACCEPTED", metadata: { party: partyProof } }
  );

  await prisma.accordEvent.createMany({ data: events });

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

  return {
    accord: updated,
    verifyUrl: `${baseUrl}/verifier/${accord.publicToken}`,
    partyProof,
  };
}

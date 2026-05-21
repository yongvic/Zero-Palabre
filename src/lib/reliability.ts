import { prisma } from "@/lib/prisma";

const SCORE_DELTAS: Record<string, number> = {
  HONORED: 5,
  ACCEPTED: 2,
  REJECTED_INITIATOR: -1,
  DISPUTED: -10,
  DISPUTE_WON: 8,
  EXPIRED: -3,
};

export async function updateReliabilityScore(
  userId: string,
  event: keyof typeof SCORE_DELTAS
) {
  const delta = SCORE_DELTAS[event] ?? 0;
  const existing = await prisma.reliabilityScore.findUnique({
    where: { userId },
  });

  const nextScore = Math.min(
    100,
    Math.max(0, (existing?.score ?? 50) + delta)
  );

  await prisma.reliabilityScore.upsert({
    where: { userId },
    create: {
      userId,
      score: nextScore,
      totalAccords: 1,
      honored: event === "HONORED" ? 1 : 0,
      disputed: event === "DISPUTED" ? 1 : 0,
    },
    update: {
      score: nextScore,
      totalAccords: { increment: 1 },
      honored: event === "HONORED" ? { increment: 1 } : undefined,
      disputed: event === "DISPUTED" ? { increment: 1 } : undefined,
    },
  });
}

import { prisma } from "@/lib/prisma";

export async function findAccordForVoice(publicToken: string) {
  const accord = await prisma.accord.findUnique({
    where: { publicToken },
    include: { initiateur: true },
  });

  if (!accord) return null;

  if (["ACCEPTED", "REJECTED"].includes(accord.statut)) {
    return { accord, error: "ALREADY_PROCESSED" as const };
  }

  if (accord.inviteExpiresAt && accord.inviteExpiresAt < new Date()) {
    await prisma.accord.update({
      where: { id: accord.id },
      data: { statut: "EXPIRED" },
    });
    return { accord, error: "EXPIRED" as const };
  }

  return { accord, error: null };
}

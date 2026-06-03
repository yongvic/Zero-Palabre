import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileEditor } from "@/components/profile/profile-editor";

export default async function ProfilPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    include: { reliabilityScore: true, subscription: true },
  });

  if (!user) return null;

  const accordStats = await prisma.accord.groupBy({
    by: ["statut"],
    where: {
      OR: [{ initiateurId: user.id }, { destinataireId: user.id }],
    },
    _count: { id: true },
  });

  const countByStatut = Object.fromEntries(
    accordStats.map((s) => [s.statut, s._count.id])
  ) as Record<string, number>;

  const accepted = (countByStatut.ACCEPTED ?? 0) + (countByStatut.OVERDUE ?? 0);
  const honored = countByStatut.HONORED ?? 0;
  const inProgress = countByStatut.ACCEPTED ?? 0;
  const overdue = countByStatut.OVERDUE ?? 0;
  const disputed = countByStatut.DISPUTED ?? 0;
  const signed =
    (countByStatut.ACCEPTED ?? 0) +
    (countByStatut.OVERDUE ?? 0) +
    (countByStatut.HONORED ?? 0) +
    (countByStatut.DISPUTED ?? 0);
  const honorRate =
    signed > 0 ? Math.round((honored / signed) * 100) : null;

  return (
    <ProfileEditor
      user={{
        id: user.id,
        name: user.name,
        familyName: user.familyName,
        username: user.username,
        dateOfBirth: user.dateOfBirth
          ? user.dateOfBirth.toISOString().slice(0, 10)
          : null,
        address: user.address,
        email: user.email,
        image: user.image,
        phone: user.phone,
        kycStatus: user.kycStatus,
        subscription: user.subscription
          ? { plan: user.subscription.plan }
          : null,
        reliabilityScore: user.reliabilityScore
          ? {
              score: user.reliabilityScore.score,
              honored: user.reliabilityScore.honored,
              totalAccords: user.reliabilityScore.totalAccords,
            }
          : null,
        accordBreakdown: {
          signed,
          accepted,
          honored,
          inProgress,
          overdue,
          disputed,
          honorRate,
        },
      }}
    />
  );
}


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

  return (
    <ProfileEditor
      user={{
        id: user.id,
        name: user.name,
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
      }}
    />
  );
}


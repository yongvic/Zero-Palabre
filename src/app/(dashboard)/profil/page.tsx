import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function ProfilPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    include: { reliabilityScore: true, subscription: true },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-heading-xl text-neutral-900">Mon profil</h1>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{user?.name}</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <dl className="space-y-3 px-6 pb-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Téléphone</dt>
            <dd>{user?.phone ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">KYC</dt>
            <dd>{user?.kycStatus}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Plan</dt>
            <dd>{user?.subscription?.plan ?? "FREE"}</dd>
          </div>
          <div className="flex justify-between border-t border-neutral-150 pt-3">
            <dt className="font-medium text-neutral-700">Score de fiabilité</dt>
            <dd className="text-2xl font-bold text-primary-800">
              {user?.reliabilityScore?.score ?? 50}/100
            </dd>
          </div>
          <p className="text-xs text-neutral-500">
            {user?.reliabilityScore?.honored ?? 0} accords honorés ·{" "}
            {user?.reliabilityScore?.totalAccords ?? 0} au total
          </p>
        </dl>
      </Card>
    </div>
  );
}

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, statutToBadgeVariant } from "@/components/ui/badge";
import {
  ACCORD_STATUT_LABELS,
  ACCORD_TYPE_LABELS,
} from "@/lib/constants";
import { formatDate, formatMontant } from "@/lib/utils";

export default async function VerifierPage({
  params,
}: {
  params: { token: string };
}) {
  const accord = await prisma.accord.findUnique({
    where: { publicToken: params.token },
    include: { initiateur: { select: { name: true } } },
  });

  if (!accord) notFound();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-150 bg-neutral-0 px-4 py-4">
        <Image src="/brand/logo-vert.png" alt="Zéro-Palabre" width={120} height={32} />
      </header>
      <main className="mx-auto max-w-xl px-4 py-12">
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 p-4">
          <ShieldCheck className="h-8 w-8 text-primary-800" strokeWidth={1.5} />
          <p className="text-sm font-medium text-primary-900">
            Vérification publique Zéro-Palabre
          </p>
        </div>

        <Badge variant={statutToBadgeVariant(accord.statut)} className="mb-4">
          {ACCORD_STATUT_LABELS[accord.statut]}
        </Badge>

        <h1 className="text-heading-l text-neutral-900">{accord.reference}</h1>
        <p className="mt-2 text-neutral-600">{accord.titre}</p>

        <dl className="mt-8 space-y-4 rounded-lg border border-neutral-150 bg-neutral-0 p-6 shadow-xs">
          <div>
            <dt className="text-xs font-medium text-neutral-500">Type</dt>
            <dd className="text-sm">{ACCORD_TYPE_LABELS[accord.type]}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-500">Initiateur</dt>
            <dd className="text-sm">{accord.initiateur.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-500">Destinataire</dt>
            <dd className="text-sm">{accord.destinataireNom}</dd>
          </div>
          {accord.montant && (
            <div>
              <dt className="text-xs font-medium text-neutral-500">Montant</dt>
              <dd className="text-sm font-medium text-primary-800">
                {formatMontant(Number(accord.montant), accord.devise)}
              </dd>
            </div>
          )}
          {accord.validatedAt && (
            <div>
              <dt className="text-xs font-medium text-neutral-500">Validé le</dt>
              <dd className="text-sm">{formatDate(accord.validatedAt)}</dd>
            </div>
          )}
          {accord.contentHash && (
            <div>
              <dt className="text-xs font-medium text-neutral-500">Intégrité (SHA-256)</dt>
              <dd className="break-all font-mono text-xs text-neutral-700">
                {accord.contentHash}
              </dd>
            </div>
          )}
        </dl>

        <p className="mt-8 text-center text-xs text-neutral-500">
          Cet accord a été créé sur Zéro-Palabre. La plateforme ne remplace pas un acte juridique notarié.
        </p>
      </main>
    </div>
  );
}

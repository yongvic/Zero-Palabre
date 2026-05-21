export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ValidateAccordClient } from "@/components/accord/validate-accord-client";
import { ACCORD_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatMontant } from "@/lib/utils";
import { Badge, statutToBadgeVariant } from "@/components/ui/badge";
import { ACCORD_STATUT_LABELS } from "@/lib/constants";

export default async function ValiderPage({
  params,
}: {
  params: { token: string };
}) {
  const accord = await prisma.accord.findUnique({
    where: { publicToken: params.token },
    include: { initiateur: true, historique: { orderBy: { createdAt: "asc" } } },
  });

  if (!accord) notFound();

  if (!accord.viewedAt && accord.statut === "SENT") {
    await prisma.accord.update({
      where: { id: accord.id },
      data: { statut: "VIEWED", viewedAt: new Date() },
    });
    await prisma.accordEvent.create({
      data: { accordId: accord.id, type: "VIEWED" },
    });
  }

  const readonly = ["ACCEPTED", "REJECTED", "EXPIRED"].includes(accord.statut);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-150 bg-neutral-0 px-4 py-4">
        <Image src="/brand/logo-vert.png" alt="Zéro-Palabre" width={120} height={32} />
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Badge variant={statutToBadgeVariant(accord.statut)} className="mb-4">
          {ACCORD_STATUT_LABELS[accord.statut]}
        </Badge>
        <h1 className="text-heading-xl text-neutral-900">{accord.titre}</h1>
        <p className="mt-2 text-sm text-neutral-500">{accord.reference}</p>

        <div className="mt-8 space-y-4 rounded-lg border border-neutral-150 bg-neutral-0 p-6 shadow-xs">
          <p className="text-sm">
            <span className="text-neutral-500">Initiateur :</span>{" "}
            {accord.initiateur.name} ({accord.initiateur.email})
          </p>
          <p className="text-sm">
            <span className="text-neutral-500">Type :</span>{" "}
            {ACCORD_TYPE_LABELS[accord.type]}
          </p>
          {accord.montant && (
            <p className="text-sm font-medium text-primary-800">
              {formatMontant(Number(accord.montant), accord.devise)}
            </p>
          )}
          {accord.dateEcheance && (
            <p className="text-sm text-neutral-600">
              Échéance : {formatDate(accord.dateEcheance)}
            </p>
          )}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
            {accord.description}
          </p>
        </div>

        {!readonly ? (
          <ValidateAccordClient token={accord.publicToken} />
        ) : (
          <p className="mt-8 text-center text-sm text-neutral-600">
            Cet accord a déjà été traité.{" "}
            <a href={`/verifier/${accord.publicToken}`} className="text-primary-800 underline">
              Vérifier en ligne
            </a>
          </p>
        )}
      </main>
    </div>
  );
}

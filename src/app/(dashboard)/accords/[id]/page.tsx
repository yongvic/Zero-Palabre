import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, statutToBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ACCORD_STATUT_LABELS,
  ACCORD_TYPE_LABELS,
} from "@/lib/constants";
import { formatDate, formatDateTime, formatMontant } from "@/lib/utils";
import { Download, ExternalLink } from "lucide-react";

export default async function AccordDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const accord = await prisma.accord.findFirst({
    where: {
      id: params.id,
      initiateurId: session!.user!.id,
    },
    include: {
      historique: { orderBy: { createdAt: "asc" } },
      initiateur: true,
    },
  });

  if (!accord) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant={statutToBadgeVariant(accord.statut)} className="mb-2">
            {ACCORD_STATUT_LABELS[accord.statut]}
          </Badge>
          <h1 className="text-heading-xl text-neutral-900">{accord.titre}</h1>
          <p className="text-sm text-neutral-500">{accord.reference}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {accord.statut === "ACCEPTED" && (
            <Button variant="secondary" asChild>
              <a href={`/api/accords/${accord.id}/pdf`} target="_blank" rel="noopener">
                <Download className="h-4 w-4" strokeWidth={1.5} />
                PDF
              </a>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/verifier/${accord.publicToken}`} target="_blank">
              <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
              Vérifier
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-6 space-y-3 text-sm">
        <p><span className="text-neutral-500">Type :</span> {ACCORD_TYPE_LABELS[accord.type]}</p>
        <p><span className="text-neutral-500">Destinataire :</span> {accord.destinataireNom} — {accord.destinataireEmail}</p>
        {accord.montant && (
          <p className="font-medium text-primary-800">
            {formatMontant(Number(accord.montant), accord.devise)}
          </p>
        )}
        {accord.dateEcheance && (
          <p>Échéance : {formatDate(accord.dateEcheance)}</p>
        )}
        <p className="whitespace-pre-wrap leading-relaxed">{accord.description}</p>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">Historique</h2>
      <ul className="space-y-3">
        {accord.historique.map((ev) => (
          <li
            key={ev.id}
            className="flex items-center justify-between rounded-md border border-neutral-150 bg-neutral-0 px-4 py-3 text-sm"
          >
            <span className="font-medium">{ev.type}</span>
            <span className="text-neutral-500">{formatDateTime(ev.createdAt)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-neutral-500">
        Lien de validation :{" "}
        <a
          href={`${baseUrl}/valider/${accord.publicToken}`}
          className="text-primary-800 underline"
        >
          {baseUrl}/valider/{accord.publicToken}
        </a>
      </p>
    </div>
  );
}

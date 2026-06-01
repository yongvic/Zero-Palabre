import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/accord/copy-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ACCORD_STATUT_LABELS,
} from "@/lib/constants";
import { formatDate, formatDateTime, formatMontant, statutToBadgeVariant } from "@/lib/utils";
import { Download, ExternalLink, Calendar, User, FileText, ChevronLeft, ShieldCheck } from "lucide-react";
import { FulfillmentPanel } from "@/components/accord/fulfillment/fulfillment-panel";

export default async function AccordDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const accord = await prisma.accord.findFirst({
    where: {
      id: params.id,
      OR: [
        { initiateurId: session!.user!.id },
        { destinataireId: session!.user!.id },
      ],
    },
    include: {
      historique: { orderBy: { createdAt: "asc" } },
      initiateur: true,
    },
  });

  if (!accord) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const showFulfillment = ["ACCEPTED", "OVERDUE", "HONORED", "DISPUTED"].includes(accord.statut) && accord.montant != null;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {showFulfillment && <FulfillmentPanel accordId={accord.id} />}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Link 
          href="/accords" 
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-primary-700 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour à la liste
        </Link>
        <div className="flex flex-wrap gap-3">
          {["ACCEPTED", "HONORED", "OVERDUE"].includes(accord.statut) && (
            <Button variant="secondary" asChild className="rounded-xl shadow-sm">
              <a href={`/api/accords/${accord.id}/pdf`} target="_blank" rel="noopener">
                <Download className="h-4 w-4 mr-2" strokeWidth={2.5} />
                Télécharger le PDF accord
              </a>
            </Button>
          )}
          {accord.statut === "HONORED" && (
            <Button variant="secondary" asChild className="rounded-xl shadow-sm">
              <a href={`/api/accords/${accord.id}/pdf/fulfillment`} target="_blank" rel="noopener">
                <Download className="h-4 w-4 mr-2" strokeWidth={2.5} />
                Attestation d&apos;exécution
              </a>
            </Button>
          )}
          <Button variant="outline" asChild className="rounded-xl">
            <Link href={`/verifier/${accord.publicToken}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" strokeWidth={2.5} />
              Lien de vérification
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Main Document Content */}
        <div className="lg:col-span-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-neutral-200 bg-neutral-0 p-8 md:p-12 shadow-paper bg-paper">
             <div className="watermark-seal" />
             <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-700 to-amber-500" />
             
             <div className="relative z-10 space-y-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-start pb-8 border-b border-neutral-100">
                  <div className="space-y-4">
                    <Badge variant={statutToBadgeVariant(accord.statut)} className="h-7 px-4">
                      {ACCORD_STATUT_LABELS[accord.statut]}
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-neutral-950">
                      {accord.titre}
                    </h1>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[11px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-200">
                      {accord.reference}
                    </p>
                  </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Parties concernées</span>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900">{accord.initiateur?.name}</p>
                          <p className="text-[11px] font-medium text-neutral-500 italic">Initiateur</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900">{accord.destinataireNom}</p>
                          <p className="text-[11px] font-medium text-neutral-500 italic">Destinataire</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Conditions financières</span>
                      <p className="font-mono text-2xl font-black text-primary-700">
                        {formatMontant(accord.montant ? Number(accord.montant) : null, accord.devise)}
                      </p>
                    </div>
                    {accord.dateEcheance && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Échéance finale</span>
                        <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                          <Calendar className="h-4 w-4 text-neutral-400" />
                          {formatDate(accord.dateEcheance)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                    <FileText className="h-4 w-4 text-neutral-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Description & Termes</span>
                  </div>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-base leading-relaxed text-neutral-800 whitespace-pre-wrap font-medium">
                      {accord.description}
                    </p>
                  </div>
                </div>

                <div className="pt-10 flex items-center justify-center">
                   <div className="flex flex-col items-center gap-3">
                      <ShieldCheck className="h-12 w-12 text-primary-700/20" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-center">
                        Document certifié par Zéro-Palabre <br /> 
                        Hash: {accord.id.slice(0, 8)}...{accord.id.slice(-8)}
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-neutral-950 px-1">Historique de l&apos;accord</h2>
            <div className="space-y-3">
              {accord.historique.map((ev, idx) => (
                <div
                  key={ev.id}
                  className="relative pl-6 pb-6 last:pb-0 group"
                >
                  {idx !== accord.historique.length - 1 && (
                    <div className="absolute left-2 top-2 bottom-0 w-px bg-neutral-200 group-last:hidden" />
                  )}
                  <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-neutral-200 bg-neutral-0 group-first:border-primary-600 group-first:bg-primary-50" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-neutral-900">
                      {ev.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-[11px] font-medium text-neutral-500">{formatDateTime(ev.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-primary-50 border-primary-100 p-6 space-y-4 rounded-3xl">
             <div className="space-y-2">
               <h3 className="text-sm font-bold text-primary-900">Validation Destinataire</h3>
               <p className="text-xs leading-relaxed text-primary-800/70 font-medium">
                 Partagez ce lien unique avec votre destinataire pour qu&apos;il puisse valider numériquement cet accord.
               </p>
             </div>
             <div className="relative group">
               <div className="bg-neutral-0 border border-primary-200 rounded-xl p-3 font-mono text-[11px] text-primary-700 truncate group-hover:bg-primary-50 transition-colors">
                  {baseUrl}/valider/{accord.publicToken}
               </div>
               <CopyButton 
                 text={`${baseUrl}/valider/${accord.publicToken}`}
                 label="Copier le lien sécurisé"
               />
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

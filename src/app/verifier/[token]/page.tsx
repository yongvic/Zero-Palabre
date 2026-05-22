export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import { 
  ShieldCheck, 
  Calendar, 
  User, 
  Layers, 
  Lock, 
  Cpu, 
  DollarSign, 
  Award, 
  FileText 
} from "lucide-react";
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
    include: { initiateur: { select: { name: true, email: true } } },
  });

  if (!accord) notFound();

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Header premium et sécurisé */}
      <header className="sticky top-0 z-40 border-b border-neutral-150 bg-neutral-0/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/brand/logo-vert.png" alt="Zéro-Palabre" width={110} height={28} priority className="h-7 w-auto" />
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800 border border-primary-100">
            <ShieldCheck className="h-3.5 w-3.5 animate-pulse text-primary-700" strokeWidth={2.5} />
            Registre Public de Preuve
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-12 md:px-6">
        {/* Bandeau d'alerte de vérification publique */}
        <div className="mb-10 flex items-start gap-4 rounded-2xl border border-primary-100 bg-primary-50/30 p-5 md:p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-primary-200/10 to-transparent pointer-events-none" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
            <ShieldCheck className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary-950 uppercase tracking-wider">Certificat d&apos;Intégrité d&apos;Accord</h2>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed max-w-xl">
              Ce registre certifie publiquement que l&apos;accord référencé ci-dessous a été formalisé, horodaté et signé numériquement par les parties mentionnées sur la plateforme Zéro-Palabre. Son empreinte cryptographique garantit son inaltérabilité absolue.
            </p>
          </div>
        </div>

        {/* Le Certificat Officiel */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-150 bg-paper shadow-paper p-8 md:p-12 mb-8">
          {/* Filigrane de Sceau Officiel de l&apos;accord */}
          <div className="watermark-seal" />

          {/* Sceau visuel d&apos;excellence */}
          <div className="absolute top-8 right-8 hidden md:flex flex-col items-center justify-center border-2 border-dashed border-primary-800/10 rounded-full h-24 w-24 opacity-65 rotate-6">
            <Award className="h-10 w-10 text-primary-800" strokeWidth={1} />
            <span className="text-[7px] font-bold text-primary-800 tracking-widest mt-1">CERTIFIED</span>
          </div>

          {/* En-tête décorative du certificat */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-800 to-amber-600" />

          <div className="relative z-10 space-y-8">
            {/* Titre et Référence */}
            <div className="border-b border-neutral-100 pb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <Badge variant={statutToBadgeVariant(accord.statut)} className="px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {ACCORD_STATUT_LABELS[accord.statut]}
                </Badge>
                <h1 className="text-heading-xl font-black text-neutral-950 tracking-tight leading-tight">
                  {accord.titre}
                </h1>
                <p className="text-xs text-neutral-500 font-medium">
                  Numéro d&apos;enregistrement : <span className="font-mono bg-neutral-100 border border-neutral-150 px-2 py-0.5 rounded text-neutral-700 font-semibold">{accord.reference}</span>
                </p>
              </div>
            </div>

            {/* Fiche d&apos;identité contractuelle */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                <User className="h-5 w-5 text-primary-800 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500">Auteur de la proposition</span>
                  <span className="block text-sm font-semibold text-neutral-950 mt-1">{accord.initiateur.name || "—"}</span>
                  <span className="block text-xs text-neutral-500 font-mono mt-0.5">{accord.initiateur.email || ""}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                <User className="h-5 w-5 text-primary-800 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-500">Partie destinataire</span>
                  <span className="block text-sm font-semibold text-neutral-950 mt-1">{accord.destinataireNom}</span>
                  <span className="block text-xs text-neutral-500 font-mono mt-0.5">{accord.destinataireEmail || "—"}</span>
                </div>
              </div>
            </div>

            {/* Caractéristiques techniques de l&apos;accord */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-0 p-3">
                <Layers className="h-4.5 w-4.5 text-neutral-400 shrink-0" strokeWidth={1.5} />
                <div className="text-xs">
                  <span className="block text-[10px] font-medium text-neutral-400">Type de contrat</span>
                  <span className="font-semibold text-neutral-800">{ACCORD_TYPE_LABELS[accord.type]}</span>
                </div>
              </div>

              {accord.validatedAt && (
                <div className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-0 p-3">
                  <Calendar className="h-4.5 w-4.5 text-neutral-400 shrink-0" strokeWidth={1.5} />
                  <div className="text-xs">
                    <span className="block text-[10px] font-medium text-neutral-400">Signé et scellé le</span>
                    <span className="font-semibold text-neutral-800">{formatDate(accord.validatedAt)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Section engagement financier si spécifié */}
            {accord.montant && (
              <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-5 text-center sm:text-left relative overflow-hidden">
                <div className="absolute -right-4 -bottom-6 opacity-5 text-primary-800">
                  <Cpu className="h-28 w-28" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-800 block mb-1">Engagement financier</span>
                <span className="text-2xl font-black text-primary-800 tracking-tight block sm:inline-block leading-none">
                  {formatMontant(Number(accord.montant), accord.devise)}
                </span>
                {accord.dateEcheance && (
                  <span className="block text-[11px] font-semibold text-neutral-600 mt-2 bg-neutral-0/80 px-2 py-0.5 rounded border border-neutral-150 w-fit">
                    Date limite de réalisation : {formatDate(accord.dateEcheance)}
                  </span>
                )}
              </div>
            )}

            {/* Termes officiels scellés */}
            {accord.description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                  <FileText className="h-4 w-4 text-neutral-400 shrink-0" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Contenu certifié de l&apos;accord</span>
                </div>
                <div className="bg-neutral-50/70 rounded-xl border border-neutral-100 p-4 md:p-5 text-[14px] leading-relaxed text-neutral-800 whitespace-pre-wrap font-normal select-all">
                  {accord.description}
                </div>
              </div>
            )}

            {/* Terminal Cryptographique d&apos;Intégrité (SHA-256) */}
            {accord.contentHash && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                  <Lock className="h-4 w-4 text-neutral-400 shrink-0" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Horodatage & Preuve Blockchain (SHA-256)</span>
                </div>
                <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-[11px] tracking-tight text-neutral-200 shadow-lg overflow-x-auto select-all">
                  <span className="block text-primary-400 mb-1 font-bold text-[9px] uppercase tracking-wider">// HASH D&apos;INTÉGRITÉ DE L&apos;ACCORD (INALTÉRABLE)</span>
                  <span className="block break-all text-neutral-100 font-semibold">{accord.contentHash}</span>
                  <div className="absolute right-3 bottom-3 text-[9px] font-bold text-neutral-500 uppercase tracking-widest pointer-events-none">ZP SECURE</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Note de réassurance et d&apos;information légale */}
        <p className="text-center text-xs leading-relaxed text-neutral-500 max-w-lg mx-auto">
          Cet enregistrement officiel fait office de preuve cryptographique et d&apos;acte d&apos;intégrité. En cas de contestation ou de litige, l&apos;empreinte SHA-256 permet de vérifier qu&apos;aucune modification n&apos;a été apportée au document d&apos;origine après sa signature.
        </p>
      </main>
    </div>
  );
}

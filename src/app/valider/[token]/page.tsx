export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicPageShell } from "@/components/layout/public-page-shell";
import { PartyAccordWizard } from "@/components/accord/party-flow/party-accord-wizard";
import { ACCORD_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatMontant, statutToBadgeVariant } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ACCORD_STATUT_LABELS } from "@/lib/constants";
import { accordToSnapshot } from "@/lib/party-session/terms";
import { isInviteExpired, inviteExpiryLabel } from "@/lib/invite-expiry";
import { Calendar, Clock, FileText, Layers, ShieldCheck, User } from "lucide-react";

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

  if (
    isInviteExpired(accord) &&
    !["ACCEPTED", "REJECTED", "EXPIRED"].includes(accord.statut)
  ) {
    await prisma.accord.update({
      where: { id: accord.id },
      data: { statut: "EXPIRED" },
    });
    accord.statut = "EXPIRED";
  }

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
    <PublicPageShell badge="Validation d'accord">
        <div className="mb-10 text-center md:text-left">
          <div className="mb-4 flex flex-col items-center gap-3 md:flex-row md:justify-between">
            <Badge variant={statutToBadgeVariant(accord.statut)} className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
              {ACCORD_STATUT_LABELS[accord.statut]}
            </Badge>
            <span className="text-xs font-mono text-neutral-400 glass-card-dark px-3 py-1 rounded-full border border-white/10">
              Réf : {accord.reference}
            </span>
          </div>
          <h1 className="text-heading-xl text-neutral-50 font-extrabold tracking-tight md:text-3xl leading-tight">
            {accord.titre}
          </h1>
          <p className="mt-3 text-base text-neutral-400 max-w-xl leading-relaxed">
            Proposition officielle de <strong className="text-neutral-200 font-semibold">{accord.initiateur.name}</strong>. Révisez les termes avant de vous engager.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl glass-paper p-8 md:p-12 mb-8">
          {/* Filigrane de Sceau Officiel de l&apos;accord */}
          <div className="watermark-seal" />

          {/* En-tête décorative de l&apos;accord */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-800 to-amber-600" />

          <div className="relative z-10 space-y-8">
            {/* Grille d&apos;informations clés */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                <User className="h-5 w-5 text-primary-800 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Initiateur de l&apos;accord</span>
                  <span className="block text-sm font-semibold text-neutral-900 mt-1">{accord.initiateur.name}</span>
                  <span className="block text-xs text-neutral-500 font-mono mt-0.5">{accord.initiateur.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                <Layers className="h-5 w-5 text-primary-800 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Type de formalisation</span>
                  <span className="block text-sm font-semibold text-neutral-900 mt-1">{ACCORD_TYPE_LABELS[accord.type]}</span>
                  <span className="block text-xs text-neutral-500 mt-0.5">Preuve numérique certifiée</span>
                </div>
              </div>
            </div>

            {/* Traitement monumental du montant si présent */}
            {accord.montant && (
              <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-6 text-center md:text-left relative overflow-hidden">
                <div className="absolute -right-4 -bottom-6 opacity-5 text-primary-800">
                  <ShieldCheck className="h-32 w-32" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-800 block mb-1.5">Engagement Financier</span>
                <span className="text-display-l text-primary-800 font-extrabold tracking-tight block md:inline-block leading-none">
                  {formatMontant(Number(accord.montant), accord.devise)}
                </span>
                {accord.dateEcheance && (
                  <div className="mt-3 flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-neutral-600 bg-neutral-0/80 px-3 py-1.5 rounded-full border border-neutral-150 w-fit">
                    <Calendar className="h-3.5 w-3.5 text-amber-600 shrink-0" strokeWidth={2} />
                    Échéance de paiement : {formatDate(accord.dateEcheance)}
                  </div>
                )}
              </div>
            )}

            {/* Termes et description de l&apos;accord */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <FileText className="h-4.5 w-4.5 text-neutral-500 shrink-0" strokeWidth={1.5} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Termes détaillés de l&apos;accord</h3>
              </div>
              <div className="relative rounded-xl border border-neutral-100 bg-neutral-0 p-5 md:p-6 shadow-xs min-h-[140px] flex items-center justify-center">
                <div className="absolute top-3 left-4 text-3xl font-serif text-neutral-200 pointer-events-none select-none">«</div>
                <p className="relative z-10 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-800 font-normal w-full px-2">
                  {accord.description}
                </p>
                <div className="absolute bottom-1 right-4 text-3xl font-serif text-neutral-200 pointer-events-none select-none">»</div>
              </div>
            </div>

            {/* Note de sécurité contextuelle */}
            <div className="rounded-lg border border-neutral-150 bg-neutral-50 p-4 text-xs text-neutral-600 leading-relaxed">
              <strong className="text-neutral-900 font-semibold block mb-1">ℹ️ Informations importantes pour le destinataire</strong>
              Une fois cet accord validé par vos soins, il deviendra totalement immuable. Une preuve certifiée sous format PDF intégrant un code QR unique et un horodatage cryptographique sera générée à vie sur la plateforme. Le lien de validation expire {inviteExpiryLabel()} après l&apos;envoi.
            </div>
          </div>
        </div>

        {/* Formulaire d&apos;action de validation ou notification */}
        <div className="glass-card rounded-2xl p-6 md:p-8">
          {!readonly ? (
            <>
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                Parcours de prise de position
              </h3>
              <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
                Confirmez votre identité, validez chaque terme de l&apos;accord puis scellez votre
                engagement. Chaque étape est horodatée et fera partie de la preuve numérique.
              </p>
              <PartyAccordWizard
                token={accord.publicToken}
                initialAccord={accordToSnapshot(accord)}
              />
            </>
          ) : accord.statut === "EXPIRED" ? (
            <div className="text-center py-6">
              <Clock className="h-10 w-10 text-neutral-500 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-base font-bold text-neutral-900 mb-2">Lien expiré</h3>
              <p className="text-sm text-neutral-600 mb-6 max-w-sm mx-auto leading-relaxed">
                Ce lien n&apos;est plus valide : le délai de {inviteExpiryLabel()} après
                l&apos;envoi est dépassé. Demandez à l&apos;initiateur de vous renvoyer une
                invitation.
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <ShieldCheck className="h-10 w-10 text-primary-800 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-base font-bold text-neutral-900 mb-2">Accord déjà traité</h3>
              <p className="text-sm text-neutral-600 mb-6 max-w-sm mx-auto leading-relaxed">
                Cet accord numérique a été finalisé et scellé. Vous pouvez consulter les détails de sa validation ou sa preuve publique en ligne.
              </p>
              <a
                href={`/verifier/${accord.publicToken}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-800 hover:bg-primary-700 text-neutral-0 text-sm font-semibold tracking-tight min-h-[44px] px-6 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-800/40"
              >
                Vérifier l&apos;accord en ligne
              </a>
            </div>
          )}
        </div>
    </PublicPageShell>
  );
}

import { Lock, Sparkles } from "lucide-react";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { trustLevelLabel } from "@/lib/fulfillment/trust";

type Props = {
  accordStatut: string;
  dateEcheance: Date | null;
  fulfillment: {
    status: string;
    amountDeclared: { toString(): string } | null;
    paidAt: Date | null;
    paymentMethod: string | null;
    reference: string | null;
    declaredName: string | null;
    confirmedAt: Date | null;
    fulfillmentHash: string | null;
    trustLevel: number;
    proofData: string | null;
    confirmedBy: { name: string | null; email: string } | null;
  } | null;
  accordId: string;
};

function TrustDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={trustLevelLabel(level)}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rounded-full ${i <= level ? "bg-primary-600" : "bg-neutral-200"}`}
        />
      ))}
      <span className="text-[11px] text-neutral-600 ml-2">{trustLevelLabel(level)}</span>
    </div>
  );
}

export function VerifierExecutionBlock({
  accordStatut,
  dateEcheance,
  fulfillment,
  accordId,
}: Props) {
  const hasFinancialTerms = dateEcheance != null;
  if (!hasFinancialTerms && !fulfillment) return null;

  const honored = accordStatut === "HONORED" && fulfillment?.status === "CONFIRMED";
  const pending =
    ["ACCEPTED", "OVERDUE"].includes(accordStatut) &&
    (!fulfillment || fulfillment.status === "PENDING");
  const declared = fulfillment?.status === "DECLARED";

  return (
    <div className="glass-card relative mb-8 overflow-hidden rounded-2xl p-6 md:p-8">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-primary-600" />
      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 mb-5">
        <Sparkles className="h-4 w-4 text-amber-600" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
          Exécution (distincte de la signature)
        </h2>
      </div>

      {honored && fulfillment ? (
        <div className="space-y-4 text-sm">
          <p className="font-bold text-primary-800 text-base">Statut : Honoré</p>
          {fulfillment.paidAt && (
            <p>
              <span className="text-neutral-500">Date d&apos;exécution :</span>{" "}
              {formatDate(fulfillment.paidAt)}
            </p>
          )}
          {fulfillment.declaredName && (
            <p>
              <span className="text-neutral-500">Déclaré par :</span> {fulfillment.declaredName}
            </p>
          )}
          {fulfillment.confirmedBy && (
            <p>
              <span className="text-neutral-500">Confirmé par :</span>{" "}
              {fulfillment.confirmedBy.name ?? fulfillment.confirmedBy.email}
            </p>
          )}
          {fulfillment.paymentMethod && (
            <p>
              <span className="text-neutral-500">Mode :</span>{" "}
              {PAYMENT_METHOD_LABELS[fulfillment.paymentMethod] ?? fulfillment.paymentMethod}
              {fulfillment.reference ? ` · ${fulfillment.reference}` : ""}
            </p>
          )}
          <p>
            <span className="text-neutral-500">Justificatif :</span>{" "}
            {fulfillment.proofData ? "fourni" : "non fourni"}
          </p>
          <TrustDots level={fulfillment.trustLevel} />
          {fulfillment.fulfillmentHash && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 font-mono text-[10px] text-neutral-200 break-all">
              <span className="text-primary-400 block text-[9px] font-bold mb-1">
                HASH D&apos;EXÉCUTION
              </span>
              {fulfillment.fulfillmentHash}
            </div>
          )}
          <a
            href={`/api/accords/${accordId}/pdf/fulfillment`}
            className="inline-flex text-sm font-semibold text-primary-800 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Télécharger l&apos;attestation d&apos;exécution (PDF)
          </a>
        </div>
      ) : declared ? (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-4">
          Remboursement déclaré — en attente de confirmation du créancier.
        </p>
      ) : pending ? (
        <p className="text-sm text-neutral-600 leading-relaxed">
          {accordStatut === "OVERDUE"
            ? "Échéance dépassée — exécution en attente."
            : "En attente d'exécution (remboursement ou réalisation des termes)."}
          <span className="block mt-2 text-xs text-neutral-500">
            Un accord signé ne signifie pas qu&apos;il a été honoré.
          </span>
        </p>
      ) : (
        <p className="text-sm text-neutral-600">Aucune exécution enregistrée.</p>
      )}

      <div className="mt-4 flex items-start gap-2 text-[10px] text-neutral-500">
        <Lock className="h-3 w-3 shrink-0 mt-0.5" />
        Confirmation mutuelle sur plateforme — pas une preuve bancaire.
      </div>
    </div>
  );
}

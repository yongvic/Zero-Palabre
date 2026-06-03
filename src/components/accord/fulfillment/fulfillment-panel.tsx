"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Clock, Copy, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatMontant } from "@/lib/utils";

type FulfillmentData = {
  eligible: boolean;
  isCreditor: boolean;
  notarialWallet?: boolean;
  repaymentMode?: string | null;
  repaymentModeLabel?: string | null;
  walletBalance?: number | null;
  montantRequired?: number;
  accordStatut: string;
  montant: number;
  daysUntilDue: number | null;
  daysOverdue: number;
  executerUrl: string | null;
  fulfillment: {
    status: string;
    amountDeclared: number | null;
    declaredName: string | null;
  } | null;
};

export function FulfillmentPanel({ accordId }: { accordId: string }) {
  const [data, setData] = useState<FulfillmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/accords/${accordId}/fulfillment`);
    const json = await res.json();
    setLoading(false);
    if (res.ok) setData(json.data);
  }, [accordId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDispute() {
    if (disputeReason.trim().length < 5) {
      setError("Motif requis.");
      return;
    }
    const res = await fetch(`/api/accords/${accordId}/fulfillment/dispute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: disputeReason.trim() }),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error?.message ?? "Erreur");
      return;
    }
    window.location.reload();
  }

  async function declareWalletRepayment() {
    setActionLoading(true);
    setError("");
    const res = await fetch(`/api/accords/${accordId}/repayment/declare`, { method: "POST" });
    const json = await res.json();
    setActionLoading(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Erreur");
      return;
    }
    await load();
  }

  if (loading || !data?.eligible) return null;

  const statut = data.accordStatut;
  const isOverdue = statut === "OVERDUE";
  const isHonored = statut === "HONORED";
  const declared = data.fulfillment?.status === "DECLARED";
  const isScheduled = data.repaymentMode === "SCHEDULED_DEBIT";
  const isDueSoon =
    data.daysUntilDue != null && data.daysUntilDue >= 0 && data.daysUntilDue <= 7 && !isHonored;
  const canWalletDeclare =
    data.notarialWallet &&
    !data.isCreditor &&
    data.repaymentMode === "MUTUAL_CONFIRM" &&
    !declared &&
    !isHonored;

  const insufficientBalance =
    data.walletBalance != null &&
    data.montantRequired != null &&
    data.walletBalance < data.montantRequired;

  const bannerClass = cn(
    "glass-card rounded-2xl p-5 md:p-6 space-y-4",
    isOverdue && !isHonored && "ring-1 ring-amber-500/30"
  );

  let statusLine = "En cours — suivi d'exécution";
  if (isHonored) statusLine = "Accord honoré — remboursement confirmé";
  else if (isOverdue)
    statusLine = `En retard — échéance dépassée depuis ${data.daysOverdue} jour(s)`;
  else if (data.daysUntilDue != null && data.daysUntilDue >= 0)
    statusLine = `En cours — échéance dans ${data.daysUntilDue} jour(s)`;

  return (
    <div className={bannerClass}>
      <div className="flex items-start gap-3">
        {isOverdue && !isHonored ? (
          <AlertTriangle className="h-6 w-6 text-amber-700 shrink-0" />
        ) : isHonored ? (
          <CheckCircle className="h-6 w-6 text-primary-800 shrink-0" />
        ) : (
          <Clock className="h-6 w-6 text-primary-800 shrink-0" />
        )}
        <div>
          <h3 className="text-sm font-bold text-neutral-950">Exécution de l&apos;accord</h3>
          <p className="text-xs text-neutral-600 mt-0.5">{statusLine}</p>
          {data.notarialWallet && data.repaymentModeLabel && (
            <p className="text-[11px] text-neutral-500 mt-1">
              Mode : {data.repaymentModeLabel}
            </p>
          )}
          <p className="text-[11px] text-neutral-500 mt-2">
            La signature ne vaut pas remboursement — cette section suit l&apos;exécution réelle.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
        <span className={cn("h-2 w-2 rounded-full", "bg-primary-600")} />
        Signé
        <span className="text-neutral-300">──</span>
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            isOverdue || isHonored ? "bg-amber-500" : "bg-neutral-300"
          )}
        />
        Échéance
        <span className="text-neutral-300">──</span>
        <span
          className={cn("h-2 w-2 rounded-full", isHonored ? "bg-primary-600" : "bg-neutral-300")}
        />
        Honoré
      </div>

      {isDueSoon && (
        <p className="text-xs text-amber-900 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
          {data.daysUntilDue === 0
            ? "Échéance aujourd'hui — une relance vous a été envoyée in-app et par email."
            : data.daysUntilDue === 1
              ? "Échéance demain — pensez au remboursement avant la date limite."
              : `Échéance dans ${data.daysUntilDue} jours — vous recevrez des rappels à J-7, J-3 et J-1.`}
        </p>
      )}

      {data.notarialWallet && isScheduled && !isHonored && (
        <p className="text-xs text-neutral-600 rounded-xl bg-neutral-50 border border-neutral-100 px-4 py-3">
          Le montant sera prélevé automatiquement sur le portefeuille de l&apos;emprunteur à
          l&apos;échéance ({formatMontant(data.montant, "XOF")}).
        </p>
      )}

      {!isHonored && data.isCreditor && (
        <div className="flex flex-wrap gap-2">
          {declared ? (
            <Button asChild>
              <Link href={`/accords/${accordId}/execution`}>Confirmer le remboursement reçu</Link>
            </Button>
          ) : (
            <p className="text-xs text-neutral-600 w-full">
              {data.notarialWallet && isScheduled
                ? "Prélèvement automatique en attente de l'échéance."
                : "En attente de déclaration de l'emprunteur."}
              {!data.notarialWallet && data.executerUrl && (
                <button
                  type="button"
                  className="ml-2 inline-flex items-center gap-1 text-primary-700 font-semibold"
                  onClick={() => {
                    void navigator.clipboard.writeText(data.executerUrl!);
                  }}
                >
                  <Copy className="h-3 w-3" /> Copier le lien débiteur
                </button>
              )}
            </p>
          )}
          {isOverdue && !declared && (
            <Button variant="secondary" onClick={() => setDisputeOpen(true)}>
              Le paiement n&apos;est pas arrivé
            </Button>
          )}
        </div>
      )}

      {canWalletDeclare && (
        <div className="space-y-3 rounded-xl border border-primary-100 bg-primary-50/50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary-900">
            <Wallet className="h-4 w-4" />
            Remboursement portefeuille
          </div>
          {data.walletBalance != null && (
            <p className="text-xs text-neutral-600">
              Votre solde : {formatMontant(data.walletBalance, "XOF")} · Montant dû :{" "}
              {formatMontant(data.montantRequired ?? data.montant, "XOF")}
            </p>
          )}
          {insufficientBalance && (
            <p className="text-xs text-amber-800">
              Solde insuffisant. Rechargez votre portefeuille avant de rembourser.
            </p>
          )}
          <Button
            className="w-full sm:w-auto gap-2"
            loading={actionLoading}
            disabled={insufficientBalance}
            onClick={() => void declareWalletRepayment()}
          >
            <Wallet className="h-4 w-4" />
            Rembourser depuis mon portefeuille
          </Button>
        </div>
      )}

      {!isHonored && !data.isCreditor && !data.notarialWallet && data.executerUrl && (
        <Button asChild className="w-full sm:w-auto">
          <a href={data.executerUrl}>Déclarer mon remboursement</a>
        </Button>
      )}

      {error && (
        <p className="text-xs text-error-700 rounded-lg bg-error-50 px-3 py-2">{error}</p>
      )}

      {isHonored && (
        <Button variant="secondary" asChild>
          <a href={`/api/accords/${accordId}/pdf/fulfillment`} target="_blank" rel="noopener">
            Télécharger l&apos;attestation d&apos;exécution
          </a>
        </Button>
      )}

      {disputeOpen && (
        <div className="space-y-2 pt-2 border-t border-amber-200/60">
          <textarea
            className="w-full min-h-[72px] rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            placeholder="Décrivez le problème…"
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
          />
          {error && <p className="text-xs text-error-700">{error}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDisputeOpen(false)}>
              Annuler
            </Button>
            <Button variant="danger" size="sm" onClick={openDispute}>
              Ouvrir un litige
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

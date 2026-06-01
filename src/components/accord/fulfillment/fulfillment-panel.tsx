"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Clock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FulfillmentData = {
  eligible: boolean;
  isCreditor: boolean;
  accordStatut: string;
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

  if (loading || !data?.eligible) return null;

  const statut = data.accordStatut;
  const isOverdue = statut === "OVERDUE";
  const isHonored = statut === "HONORED";
  const declared = data.fulfillment?.status === "DECLARED";

  const bannerClass = cn(
    "rounded-2xl border p-5 md:p-6 space-y-4",
    isHonored && "border-primary-200 bg-primary-50/40",
    isOverdue && !isHonored && "border-amber-200 bg-amber-50/50",
    !isOverdue && !isHonored && "border-primary-100 bg-primary-50/30"
  );

  let statusLine = "En cours — suivi d'exécution";
  if (isHonored) statusLine = "Accord honoré";
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
          <h3 className="text-sm font-bold text-neutral-900">Exécution de l&apos;accord</h3>
          <p className="text-xs text-neutral-600 mt-0.5">{statusLine}</p>
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

      {!isHonored && data.isCreditor && (
        <div className="flex flex-wrap gap-2">
          {declared ? (
            <Button asChild>
              <Link href={`/accords/${accordId}/execution`}>Confirmer le remboursement reçu</Link>
            </Button>
          ) : (
            <p className="text-xs text-neutral-600 w-full">
              En attente de déclaration du débiteur.
              {data.executerUrl && (
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

      {!isHonored && !data.isCreditor && data.executerUrl && (
        <Button asChild className="w-full sm:w-auto">
          <a href={data.executerUrl}>Déclarer mon remboursement</a>
        </Button>
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

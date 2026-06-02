"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatDate, formatMontant } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";

type Props = {
  accordId: string;
  titre: string;
  reference: string;
  montant: number;
  devise: string;
  declaredName: string;
  amountDeclared: number;
  paidAt: string;
  paymentMethod: string;
  referenceTx: string | null;
  hasProof: boolean;
  proofUrl?: string | null;
};

export function ConfirmFulfillmentClient(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [honored, setHonored] = useState(false);

  async function confirm() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/accords/${props.accordId}/fulfillment/confirm`, {
      method: "POST",
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Erreur");
      return;
    }
    setHonored(true);
    router.refresh();
  }

  async function reject() {
    if (reason.trim().length < 5) {
      setError("Motif requis (5 caracteres minimum).");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/accords/${props.accordId}/fulfillment/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason.trim() }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Erreur");
      return;
    }
    router.push(`/accords/${props.accordId}`);
    router.refresh();
  }

  if (honored) {
    return (
      <div className="text-center py-10 space-y-4">
        <CheckCircle className="h-16 w-16 text-primary-700 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold text-neutral-900">Accord honore</h2>
        <p className="text-sm text-neutral-600">
          Merci d'avoir confirme. L'attestation d'execution est disponible.
        </p>
        <Button asChild>
          <a href={`/api/accords/${props.accordId}/pdf/fulfillment`} target="_blank" rel="noopener">
            Telecharger l'attestation
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Confirmer la reception</h1>
        <p className="text-sm text-neutral-600 mt-1">
          {props.declaredName} declare un remboursement pour {props.titre}
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-neutral-500">Montant accord</span>
          <span className="font-bold">{formatMontant(props.montant, props.devise)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-neutral-500">Montant declare</span>
          <span
            className={
              Math.abs(props.amountDeclared - props.montant) < 0.01
                ? "font-bold text-primary-800"
                : "font-bold text-error-700"
            }
          >
            {formatMontant(props.amountDeclared, props.devise)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-neutral-500">Date</span>
          <span className="font-semibold">{formatDate(props.paidAt)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-neutral-500">Mode</span>
          <span className="font-semibold">
            {PAYMENT_METHOD_LABELS[props.paymentMethod] ?? props.paymentMethod}
            {props.referenceTx ? ` · ${props.referenceTx}` : ""}
          </span>
        </div>
        {props.hasProof && (
          <div className="space-y-2">
            <p className="text-xs text-primary-700 font-medium">Justificatif fourni par le debiteur</p>
            {props.proofUrl && (
              <a href={props.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary-800 underline">
                Ouvrir le justificatif
              </a>
            )}
            {props.proofUrl && (
              <img src={props.proofUrl} alt="Justificatif" className="max-h-44 rounded-lg border border-neutral-200 object-cover" />
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-800">
          {error}
        </div>
      )}

      {rejectMode ? (
        <div className="space-y-3">
          <Label>Motif du refus</Label>
          <textarea
            className="min-h-[80px] w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Paiement non recu ou montant incorrect..."
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setRejectMode(false)}>
              Annuler
            </Button>
            <Button variant="danger" loading={loading} onClick={reject}>
              Confirmer le refus
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button className="min-h-[52px] gap-2" loading={loading} onClick={confirm}>
            <CheckCircle className="h-5 w-5" />
            Confirmer la reception
          </Button>
          <Button
            variant="secondary"
            className="min-h-[52px] gap-2"
            onClick={() => setRejectMode(true)}
          >
            <XCircle className="h-5 w-5" />
            Refuser
          </Button>
        </div>
      )}

      <p className="text-xs text-neutral-500">
        En cas de refus, un litige sera ouvert sur la plateforme.
      </p>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, PenLine, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ACCORD_STATUT_LABELS } from "@/lib/constants";

type SignState = {
  reference: string;
  titre: string;
  statut: string;
  role: "INITIATOR" | "COUNTERPARTY" | null;
  signatureExpiresAt: string | null;
  hasNotarialAct: boolean;
};

export function SignAccordClient({ accordId }: { accordId: string }) {
  const router = useRouter();
  const [info, setInfo] = useState<SignState | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedName, setSignedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/accords/${accordId}/sign`);
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Erreur");
      return;
    }
    setInfo(json.data as SignState);
  }, [accordId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit() {
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/accords/${accordId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedName: signedName.trim() }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Erreur");
      return;
    }
    router.push(`/accords/${accordId}`);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        <p className="text-sm text-neutral-600">Chargement…</p>
      </div>
    );
  }

  if (!info) {
    return (
      <Card className="p-6 text-sm text-error-700">{error || "Accord introuvable"}</Card>
    );
  }

  const canSign =
    (info.statut === "AWAITING_INITIATOR_SIGN" && info.role === "INITIATOR") ||
    (info.statut === "AWAITING_COUNTERPARTY_SIGN" && info.role === "COUNTERPARTY");

  const done = ["DUAL_SIGNED", "ESCROW_FUNDED", "ACTIVE", "HONORED"].includes(info.statut);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Signature</p>
        <h1 className="text-2xl font-bold text-neutral-950">{info.titre}</h1>
        <p className="mt-1 font-mono text-xs text-neutral-500">{info.reference}</p>
        <p className="mt-2 text-sm text-neutral-600">
          Statut : {ACCORD_STATUT_LABELS[info.statut] ?? info.statut}
        </p>
        {info.signatureExpiresAt && info.statut === "AWAITING_COUNTERPARTY_SIGN" && (
          <p className="mt-1 text-xs text-amber-700">
            Expire le {new Date(info.signatureExpiresAt).toLocaleString("fr-FR")}
          </p>
        )}
      </div>

      {done && (
        <Card className="space-y-4 p-6">
          <p className="text-sm text-neutral-700">Accord signé par les deux parties.</p>
          <Button asChild variant="secondary" className="w-full gap-2">
            <a href={`/api/accords/${accordId}/pdf/notarial`} target="_blank" rel="noopener">
              <FileText className="h-4 w-4" />
              Télécharger l&apos;acte notarial
            </a>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href={`/accords/${accordId}`}>Retour à l&apos;accord</Link>
          </Button>
        </Card>
      )}

      {canSign && (
        <Card className="space-y-4 p-6">
          <p className="text-sm text-neutral-600 leading-relaxed">
            En tapant votre nom complet ci-dessous, vous signez électroniquement cet acte notarial.
          </p>
          <div className="space-y-2">
            <Label htmlFor="signedName">Nom complet (signature)</Label>
            <Input
              id="signedName"
              placeholder="Ex: Koffi Mensah"
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
              className="h-12"
            />
          </div>
          {error && (
            <p className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-800">
              {error}
            </p>
          )}
          <Button
            className="w-full h-12 gap-2"
            loading={submitting}
            onClick={() => void submit()}
            disabled={signedName.trim().length < 3}
          >
            <PenLine className="h-4 w-4" />
            Signer l&apos;accord
          </Button>
        </Card>
      )}

      {!canSign && !done && (
        <Card className="p-6 text-sm text-neutral-600">
          En attente de l&apos;autre partie ou accord non disponible pour signature.
          <Button asChild variant="link" className="mt-2 px-0">
            <Link href={`/accords/${accordId}`}>Voir l&apos;accord</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}

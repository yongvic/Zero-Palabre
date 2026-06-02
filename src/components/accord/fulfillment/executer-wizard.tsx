"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type AccordInfo = {
  reference: string;
  titre: string;
  montant: number;
  montantLabel: string;
  destinataireNom: string;
  destinataireEmail: string;
  creditorName: string;
  publicToken: string;
};

const METHODS = Object.keys(PAYMENT_METHOD_LABELS) as Array<keyof typeof PAYMENT_METHOD_LABELS>;

export function ExecuterWizard({ fulfillToken }: { fulfillToken: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [accord, setAccord] = useState<AccordInfo | null>(null);
  const [step, setStep] = useState(1);
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<string>("TMONEY");
  const [reference, setReference] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofName, setProofName] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/fulfillment/${fulfillToken}`);
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Lien invalide");
      return;
    }
    const a = json.data.accord as AccordInfo;
    setAccord(a);
    setName(a.destinataireNom);
    setEmail(a.destinataireEmail);
  }, [fulfillToken]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleProofFile(file: File | null) {
    if (!file) return;
    setUploadingProof(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`/api/fulfillment/${fulfillToken}/proof-upload`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Upload impossible");

      setProofUrl(json.data.proofUrl as string);
      setProofName(file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload impossible");
    } finally {
      setUploadingProof(false);
    }
  }

  async function submit() {
    if (!accord) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/fulfillment/${fulfillToken}/declare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountDeclared: accord.montant,
          paidAt,
          paymentMethod,
          reference: reference.trim() || undefined,
          proofUrl: proofUrl ?? undefined,
          declaredName: name.trim(),
          declaredEmail: email.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Erreur");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary-700" />
        <p className="text-sm text-neutral-600">Chargement...</p>
      </div>
    );
  }

  if (error && !accord) {
    return (
      <div className="rounded-xl border border-error-200 bg-error-50 p-6 text-sm text-error-800">
        {error}
      </div>
    );
  }

  if (!accord) return null;

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 py-8"
      >
        <CheckCircle className="h-16 w-16 text-primary-700 mx-auto" />
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Declaration enregistree</h2>
          <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto">
            Accord {accord.reference} — en attente de confirmation de {accord.creditorName}.
          </p>
        </div>
        <Button asChild variant="secondary">
          <a href={`/verifier/${accord.publicToken}`}>Voir le suivi public</a>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Declaration de remboursement
        </p>
        <h1 className="text-xl font-bold text-neutral-900 mt-1">{accord.titre}</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Creancier : {accord.creditorName} · {accord.montantLabel}
        </p>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              step >= s ? "bg-primary-600" : "bg-neutral-200"
            )}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-800">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="space-y-2">
              <Label>Montant rembourse</Label>
              <Input value={accord.montantLabel} readOnly className="bg-neutral-50 font-semibold" />
            </div>
            <div className="space-y-2">
              <Label>Date du paiement</Label>
              <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Votre nom</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Continuer <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <Label>Mode de paiement</Label>
            <div className="grid grid-cols-2 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={cn(
                    "rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-all",
                    paymentMethod === m
                      ? "border-primary-600 bg-primary-50 text-primary-800"
                      : "border-neutral-200 bg-neutral-0 text-neutral-700 hover:border-neutral-300"
                  )}
                >
                  {PAYMENT_METHOD_LABELS[m]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Continuer <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="space-y-2">
              <Label>Reference transaction (optionnel)</Label>
              <Input
                placeholder="Ex: 235AF89"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Justificatif (optionnel)</Label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 py-8 hover:border-primary-300">
                <Camera className="h-5 w-5 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-600">Photo du recu</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    void handleProofFile(e.target.files?.[0] ?? null);
                  }}
                />
              </label>
              {uploadingProof && (
                <p className="text-xs text-neutral-600 font-medium">Upload du justificatif...</p>
              )}
              {proofUrl && (
                <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-3">
                  <p className="text-xs text-primary-800 font-semibold">Justificatif ajoute : {proofName ?? "image"}</p>
                  <img
                    src={proofUrl}
                    alt="Apercu justificatif"
                    className="mt-2 max-h-36 rounded-lg border border-neutral-200 object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <Button className="flex-1" onClick={() => setStep(4)}>
                Continuer <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm space-y-2">
              <p>
                <span className="text-neutral-500">Montant :</span>{" "}
                <strong>{accord.montantLabel}</strong>
              </p>
              <p>
                <span className="text-neutral-500">Date :</span> {paidAt}
              </p>
              <p>
                <span className="text-neutral-500">Mode :</span>{" "}
                {PAYMENT_METHOD_LABELS[paymentMethod]}
              </p>
              <p>
                <span className="text-neutral-500">Justificatif :</span>{" "}
                {proofUrl ? "Ajoute" : "Aucun"}
              </p>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              En validant, vous certifiez sur l&apos;honneur que ces informations sont exactes.
              Le creancier devra confirmer la reception.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <Button className="flex-1" loading={saving} onClick={submit} disabled={uploadingProof}>
                Envoyer la declaration
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

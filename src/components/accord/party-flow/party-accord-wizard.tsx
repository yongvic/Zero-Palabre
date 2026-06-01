"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Edit3,
  FileText,
  Loader2,
  ShieldCheck,
  User,
  Ban,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PartyStepper } from "./party-stepper";
import type {
  PartyAccordSnapshot,
  PartySessionClient,
  PartyTermField,
} from "@/lib/party-session/types";
import { cn } from "@/lib/utils";

type Props = {
  token: string;
  initialAccord: PartyAccordSnapshot;
};

export function PartyAccordWizard({ token, initialAccord }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [accord] = useState(initialAccord);
  const [session, setSession] = useState<PartySessionClient | null>(null);
  const [termFields, setTermFields] = useState<PartyTermField[]>([]);
  const [step, setStep] = useState(1);
  const [termIndex, setTermIndex] = useState(0);
  const [amendValue, setAmendValue] = useState("");
  const [showAmendInput, setShowAmendInput] = useState(false);
  const [name, setName] = useState(initialAccord.destinataireNom);
  const [email, setEmail] = useState(initialAccord.destinataireEmail);
  const [signatureName, setSignatureName] = useState("");
  const [cgu, setCgu] = useState(false);
  const [truth, setTruth] = useState(false);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const skipAmendments = session ? !session.hasAmendments && step > 3 : false;

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/accords/${token}/party-session`);
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Impossible de démarrer le parcours");
      return;
    }
    const s = json.data.session as PartySessionClient;
    setSession(s);
    setTermFields(json.data.termFields as PartyTermField[]);
    setStep(s.currentStep);
    if (s.confirmedName) setName(s.confirmedName);
    if (s.confirmedEmail) setEmail(s.confirmedEmail);
    if (s.signatureName) setSignatureName(s.signatureName);
    setCgu(s.cguAccepted);
  }, [token]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (step === 4 && session && !session.hasAmendments && !saving) {
      void goStep(5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, session?.hasAmendments]);

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/accords/${token}/party-session`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message ?? "Erreur de sauvegarde");
    setSession(json.data.session as PartySessionClient);
    return json.data.session as PartySessionClient;
  }

  async function goStep(next: number) {
    setSaving(true);
    setError("");
    try {
      await patch({ currentStep: next });
      setStep(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleIdentity() {
    if (name.trim().length < 2) {
      setError("Indiquez votre nom complet.");
      return;
    }
    if (email.toLowerCase() !== accord.destinataireEmail.toLowerCase()) {
      setError("L'email doit correspondre à celui de l'invitation.");
      return;
    }
    setSaving(true);
    try {
      await patch({
        confirmedName: name.trim(),
        confirmedEmail: email.trim().toLowerCase(),
        currentStep: 2,
      });
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleTermAccept() {
    const field = termFields[termIndex];
    if (!field) return;
    setSaving(true);
    setError("");
    try {
      const updated = await patch({
        fieldResponse: {
          key: field.key,
          action: "accepted",
          originalValue: field.originalValue,
        },
      });
      const responses = updated.fieldResponses;
      if (termIndex < termFields.length - 1) {
        setTermIndex((i) => i + 1);
        setShowAmendInput(false);
        setAmendValue("");
      } else {
        const hasAmend = Object.values(responses).some((r) => r.action === "amended");
        await goStep(hasAmend ? 4 : 5);
        setTermIndex(0);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleTermAmend() {
    const field = termFields[termIndex];
    if (!field || !amendValue.trim()) {
      setError("Précisez votre proposition.");
      return;
    }
    setSaving(true);
    try {
      const updated = await patch({
        fieldResponse: {
          key: field.key,
          action: "amended",
          originalValue: field.originalValue,
          proposedValue: amendValue.trim(),
        },
      });
      if (termIndex < termFields.length - 1) {
        setTermIndex((i) => i + 1);
        setShowAmendInput(false);
        setAmendValue("");
      } else {
        await goStep(4);
        setTermIndex(0);
      }
      void updated;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    if (!session || !cgu || !truth) {
      setError("Acceptez les conditions et confirmez l'exactitude de vos déclarations.");
      return;
    }
    if (signatureName.trim().length < 2) {
      setError("Saisissez votre nom comme signature.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await patch({ signatureName: signatureName.trim(), cguAccepted: true, currentStep: 6 });
      const res = await fetch(`/api/accords/${token}/party-session/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Finalisation échouée");
      setVerifyUrl(json.data.verifyUrl);
      setStep(6);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleReject() {
    if (rejectReason.trim().length < 5) {
      setError("Motif du refus requis (5 caractères minimum).");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/accords/${token}/party-session/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session?.sessionId,
          commentaire: rejectReason.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Refus impossible");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
      setRejectOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary-700" />
        <p className="text-sm text-neutral-600">Préparation de votre parcours sécurisé…</p>
      </div>
    );
  }

  const currentTerm = termFields[termIndex];
  const responses = session?.fieldResponses ?? {};

  return (
    <div className="space-y-4">
      <PartyStepper currentStep={step} skipAmendments={!session?.hasAmendments && step >= 4} />

      {error && (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-800">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-error-600 hover:text-error-700 hover:bg-error-50"
          onClick={() => setRejectOpen(true)}
        >
          <Ban className="h-4 w-4" />
          Refuser l&apos;accord
        </Button>
      </div>

      {rejectOpen && (
        <div className="rounded-xl border border-error-100 bg-error-50/50 p-5 space-y-3">
          <Label>Motif du refus</Label>
          <textarea
            className="min-h-[80px] w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Expliquez pourquoi vous refusez…"
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              Annuler
            </Button>
            <Button variant="danger" loading={saving} onClick={handleReject}>
              Confirmer le refus
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-6 rounded-2xl border border-primary-100 bg-primary-50/30 p-6 md:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <User className="h-6 w-6 text-primary-800" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Confirmez votre identité</h3>
                <p className="text-sm text-neutral-600">
                  Étape 1 — preuve d&apos;identité du destinataire
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nom complet</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <Button className="w-full" loading={saving} onClick={handleIdentity}>
              Continuer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-primary-800">
                <FileText className="h-5 w-5" />
                <h3 className="font-bold">Résumé de la proposition</h3>
              </div>
              <dl className="grid gap-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-neutral-100 pb-2">
                  <dt className="text-neutral-500">Initiateur</dt>
                  <dd className="font-semibold text-neutral-900">{accord.initiateurName}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-neutral-100 pb-2">
                  <dt className="text-neutral-500">Référence</dt>
                  <dd className="font-mono text-xs">{accord.reference}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-neutral-100 pb-2">
                  <dt className="text-neutral-500">Titre</dt>
                  <dd className="font-semibold text-right">{accord.titre}</dd>
                </div>
                {accord.montant && (
                  <div className="flex justify-between gap-4 border-b border-neutral-100 pb-2">
                    <dt className="text-neutral-500">Montant</dt>
                    <dd className="font-bold text-primary-800">{accord.montant}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-neutral-500 mb-1">Description</dt>
                  <dd className="text-neutral-800 leading-relaxed">{accord.description}</dd>
                </div>
              </dl>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <Button className="flex-1" loading={saving} onClick={() => goStep(3)}>
                J&apos;ai lu le résumé — passer aux termes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && currentTerm && (
          <motion.div
            key={`term-${termIndex}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500">
              <span>Terme {termIndex + 1} / {termFields.length}</span>
              <span className="text-primary-700">{currentTerm.label}</span>
            </div>
            <div className="rounded-2xl border-2 border-primary-100 bg-neutral-0 p-6 md:p-8 shadow-sm">
              <p className="text-xs text-neutral-500 mb-2">{currentTerm.description}</p>
              <p className="text-lg font-semibold text-neutral-900 leading-relaxed whitespace-pre-wrap">
                {currentTerm.originalValue}
              </p>
            </div>

            {showAmendInput ? (
              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <Label>Votre proposition pour ce terme</Label>
                {currentTerm.multiline ? (
                  <textarea
                    className="min-h-[100px] w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
                    value={amendValue}
                    onChange={(e) => setAmendValue(e.target.value)}
                  />
                ) : (
                  <Input value={amendValue} onChange={(e) => setAmendValue(e.target.value)} />
                )}
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setShowAmendInput(false)}>
                    Annuler
                  </Button>
                  <Button className="flex-1" loading={saving} onClick={handleTermAmend}>
                    Enregistrer ma modification
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  className="min-h-[52px] gap-2"
                  loading={saving}
                  onClick={handleTermAccept}
                >
                  <CheckCircle className="h-5 w-5" />
                  J&apos;accepte ce terme
                </Button>
                <Button
                  variant="secondary"
                  className="min-h-[52px] gap-2"
                  onClick={() => {
                    setShowAmendInput(true);
                    setAmendValue(currentTerm.originalValue);
                  }}
                >
                  <Edit3 className="h-5 w-5" />
                  Je propose une modification
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {step === 4 && session && (
          <motion.div
            key="amendments"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <h3 className="text-lg font-bold">Vos modifications</h3>
            <p className="text-sm text-neutral-600">
              Ces propositions seront enregistrées dans la preuve PDF. L&apos;initiateur en sera
              informé.
            </p>
            <ul className="space-y-3">
              {Object.entries(responses)
                .filter(([, r]) => r.action === "amended")
                .map(([key, r]) => (
                  <li
                    key={key}
                    className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 text-sm"
                  >
                    <span className="font-bold text-amber-900 block mb-1">{key}</span>
                    <span className="text-neutral-500 line-through block">{r.originalValue}</span>
                    <span className="text-neutral-900 font-semibold block mt-1">
                      → {r.proposedValue}
                    </span>
                  </li>
                ))}
            </ul>
            <Button className="w-full" loading={saving} onClick={() => goStep(5)}>
              Continuer vers l&apos;engagement
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="commitment"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5 rounded-2xl border border-primary-100 bg-primary-50/20 p-6 md:p-8"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary-800" />
              <div>
                <h3 className="text-lg font-bold">Engagement formel</h3>
                <p className="text-sm text-neutral-600">Signature électronique tapée</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-0 p-4">
                <input type="checkbox" checked={cgu} onChange={(e) => setCgu(e.target.checked)} className="mt-1" />
                <span className="text-sm leading-relaxed">
                  J&apos;accepte que mes réponses soient horodatées et conservées comme preuve
                  numérique sur Zéro-Palabre.
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-0 p-4">
                <input type="checkbox" checked={truth} onChange={(e) => setTruth(e.target.checked)} className="mt-1" />
                <span className="text-sm leading-relaxed">
                  Je certifie l&apos;exactitude de mes déclarations et confirme mon engagement sur
                  cet accord.
                </span>
              </label>
            </div>
            <div className="space-y-2">
              <Label>Signature (saisissez votre nom complet)</Label>
              <Input
                placeholder={accord.destinataireNom}
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="text-lg font-semibold"
              />
            </div>
            <Button className="w-full gap-2" loading={saving} onClick={handleComplete}>
              <Sparkles className="h-4 w-4" />
              Sceller mon accord
            </Button>
          </motion.div>
        )}

        {step === 6 && verifyUrl && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100"
            >
              <CheckCircle className="h-10 w-10 text-primary-800" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-black text-neutral-900">Accord scellé</h3>
              <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                Votre parcours a été enregistré. Une preuve PDF avec horodatage et empreinte
                cryptographique est disponible.
              </p>
            </div>
            <Button asChild>
              <a href={verifyUrl}>Vérifier la preuve en ligne</a>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

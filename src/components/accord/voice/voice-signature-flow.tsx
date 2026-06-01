"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Ban,
  Sparkles,
  Loader2,
  AlertCircle,
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceRecorderPanel } from "./voice-recorder-panel";
import { useMediaRecorder } from "@/hooks/use-media-recorder";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import type { VoiceSessionPayload, VoiceMissingField } from "@/lib/voice-signature/types";
import { cn } from "@/lib/utils";

export type VoiceAccordProps = {
  token: string;
  destinataireNom: string;
  titre: string;
  reference: string;
};

type Step = "intent" | "consent" | "record" | "complete" | "confirm";

const STEPS: Step[] = ["intent", "consent", "record", "complete", "confirm"];

export function VoiceSignatureFlow({ token, destinataireNom, titre, reference }: VoiceAccordProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intent");
  const [intent, setIntent] = useState<"accept" | "reject" | null>(null);
  const [consent, setConsent] = useState(false);
  const [session, setSession] = useState<VoiceSessionPayload | null>(null);
  const [manualText, setManualText] = useState("");
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const media = useMediaRecorder();
  const speech = useSpeechRecognition("fr-FR");

  const stepIndex = STEPS.indexOf(step);

  const finalTranscript = (manualText || speech.displayText).trim();

  const uploadAudio = useCallback(
    async (audioBlob: Blob | null, sessionId?: string) => {
      if (!audioBlob) return;
      const fd = new FormData();
      fd.append("audio", audioBlob, "signature.webm");
      if (sessionId) fd.append("sessionId", sessionId);
      await fetch(`/api/accords/${token}/voice/audio`, { method: "POST", body: fd });
    },
    [token]
  );

  const analyze = useCallback(
    async (answers?: Record<string, string>) => {
      if (!intent) return;
      setAnalyzing(true);
      setError("");

      try {
        const res = await fetch(`/api/accords/${token}/voice/extract`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: finalTranscript,
            intent,
            sessionId: session?.sessionId,
            textAnswers: answers,
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          setError(json.error?.message ?? "Analyse impossible");
          return;
        }

        const data = json.data as VoiceSessionPayload;
        setSession(data);

        if (data.ready) {
          setStep("confirm");
        } else {
          setStep("complete");
        }
      } catch {
        setError("Erreur réseau pendant l'analyse.");
      } finally {
        setAnalyzing(false);
      }
    },
    [intent, token, finalTranscript, session?.sessionId]
  );

  async function handleRecordNext() {
    if (media.recording) {
      setError("Terminez l'enregistrement avant d'analyser.");
      return;
    }
    if (!finalTranscript || finalTranscript.length < 10) {
      setError("Parlez ou saisissez au moins une phrase complète.");
      return;
    }
    if (media.blob) await uploadAudio(media.blob, session?.sessionId);
    await analyze();
  }

  async function handleCompleteNext() {
    const missing = session?.missingFields ?? [];
    const empty = missing.filter((f) => !textAnswers[f.key]?.trim());
    if (empty.length > 0) {
      setError("Complétez les champs demandés ou répondez à nouveau à la voix.");
      return;
    }
    await analyze(textAnswers);
  }

  async function handleConfirm() {
    if (!session?.ready || !intent) return;
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/accords/${token}/valider`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: intent === "accept" ? "accept" : "reject",
        commentaire:
          intent === "reject"
            ? session.extracted?.commentaire ?? undefined
            : session.extracted?.commentaire ?? undefined,
        voiceSessionId: session.sessionId,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error?.message ?? "Validation échouée");
    }
  }

  function startRecording() {
    setError("");
    setManualText("");
    speech.reset();
    media.reset();
    void media.start().then(() => {
      speech.start();
    });
  }

  function stopRecording() {
    speech.stop();
    media.stop();
    if (speech.displayText && !manualText) {
      setManualText(speech.displayText);
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-1">
        {["Choix", "Voix", "Analyse", "Confirmer"].map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "h-1.5 w-full rounded-full transition-colors",
                i <= Math.min(stepIndex, 3) ? "bg-primary-600" : "bg-neutral-200"
              )}
            />
            <span className="text-[10px] font-medium text-neutral-500">{label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {analyzing && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-primary-100 bg-primary-50/50 py-10">
          <Loader2 className="h-9 w-9 animate-spin text-primary-700" />
          <p className="text-sm font-semibold text-neutral-800">Analyse par Gemini…</p>
        </div>
      )}

      {!analyzing && (
      <AnimatePresence mode="wait">
        {step === "intent" && (
          <motion.div
            key="intent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <button
              type="button"
              onClick={() => {
                setIntent("accept");
                setStep("consent");
              }}
              className="group flex flex-col items-start gap-3 rounded-2xl border-2 border-primary-100 bg-primary-50/50 p-6 text-left transition-all hover:border-primary-400 hover:shadow-md"
            >
              <CheckCircle className="h-8 w-8 text-primary-800" />
              <div>
                <p className="font-bold text-neutral-900">J&apos;accepte</p>
                <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                  Enregistrez votre accord oral. L&apos;IA vérifiera votre identité et votre consentement.
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setIntent("reject");
                setStep("consent");
              }}
              className="group flex flex-col items-start gap-3 rounded-2xl border-2 border-neutral-200 bg-neutral-0 p-6 text-left transition-all hover:border-error-300 hover:bg-error-50/30"
            >
              <Ban className="h-8 w-8 text-error-600" />
              <div>
                <p className="font-bold text-neutral-900">Je refuse</p>
                <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                  Expliquez oralement pourquoi vous refusez cet accord.
                </p>
              </div>
            </button>
          </motion.div>
        )}

        {step === "consent" && (
          <motion.div
            key="consent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700 leading-relaxed">
              <p className="font-semibold text-neutral-900 mb-2">Avant d&apos;enregistrer</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Vous êtes invité en tant que <strong>{destinataireNom}</strong></li>
                <li>Accord : <strong>{titre}</strong> ({reference})</li>
                <li>Votre voix sera transcrite et analysée par IA (Gemini)</li>
                <li>L&apos;enregistrement peut être archivé comme preuve complémentaire</li>
              </ul>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-primary-100 bg-primary-50/40 p-4">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-primary-300 text-primary-800 focus:ring-primary-600"
              />
              <span className="text-sm text-neutral-800 leading-relaxed">
                J&apos;autorise l&apos;enregistrement, la transcription et le traitement de ma voix
                pour valider cet accord sur Zéro-Palabre.
              </span>
            </label>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep("intent")}>
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <Button
                className="flex-1"
                disabled={!consent}
                onClick={() => setStep("record")}
              >
                Continuer
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === "record" && intent && (
          <motion.div
            key="record"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative space-y-4"
          >
            <p className="text-sm text-neutral-600 leading-relaxed">
              {intent === "accept" ? (
                <>
                  Dites par exemple : « Je m&apos;appelle <strong>{destinataireNom}</strong>, j&apos;accepte
                  l&apos;accord <strong>{titre}</strong>, référence {reference}. »
                </>
              ) : (
                <>Dites votre nom, que vous refusez, et le motif de votre refus.</>
              )}
            </p>

            <VoiceRecorderPanel
              recording={media.recording}
              seconds={media.seconds}
              displayText={speech.displayText}
              speechSupported={speech.supported}
              manualText={manualText}
              onManualChange={setManualText}
              onStart={startRecording}
              onStop={stopRecording}
            />

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep("consent")}>
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <Button
                className="flex-1"
                onClick={handleRecordNext}
                disabled={media.recording || !finalTranscript || analyzing}
                loading={analyzing}
              >
                Analyser ma déclaration
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === "complete" && session && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-sm font-bold text-amber-900">Quelques précisions manquent</p>
              {session.summaryFr && (
                <p className="mt-2 text-xs text-amber-950/80 italic">&laquo; {session.summaryFr} &raquo;</p>
              )}
            </div>

            <MissingFieldsForm
              fields={session.missingFields}
              values={textAnswers}
              onChange={(key, val) =>
                setTextAnswers((prev) => ({ ...prev, [key]: val }))
              }
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" className="flex-1" onClick={() => setStep("record")}>
                <MessageSquareText className="h-4 w-4" />
                Répondre à la voix
              </Button>
              <Button className="flex-1" onClick={handleCompleteNext}>
                Valider les compléments
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === "confirm" && session && intent && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-primary-900">
                <Sparkles className="h-5 w-5" />
                <p className="font-bold text-sm">Récapitulatif IA</p>
              </div>
              <p className="text-sm text-neutral-800 leading-relaxed">
                {session.summaryFr ?? session.extracted?.summaryFr}
              </p>
              <dl className="grid gap-2 text-xs border-t border-primary-100 pt-3">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Position</dt>
                  <dd className="font-semibold text-neutral-900">
                    {intent === "accept" ? "Acceptation" : "Refus"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Nom déclaré</dt>
                  <dd className="font-semibold text-neutral-900">
                    {session.extracted?.signerName ?? "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              En confirmant, vous scellerez cet accord de manière définitive. Une preuve PDF sera
              générée avec l&apos;horodatage et la trace de votre signature vocale.
            </p>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep("record")}>
                Réenregistrer
              </Button>
              <Button
                className="flex-1"
                variant={intent === "accept" ? "primary" : "danger"}
                loading={submitting}
                onClick={handleConfirm}
              >
                <CheckCircle className="h-4 w-4" />
                {intent === "accept"
                  ? "Confirmer mon acceptation"
                  : "Confirmer mon refus"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </div>
  );
}

function MissingFieldsForm({
  fields,
  values,
  onChange,
}: {
  fields: VoiceMissingField[];
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            {field.label}
          </label>
          <p className="text-xs text-neutral-500">{field.question}</p>
          <input
            type="text"
            value={values[field.key] ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full rounded-xl border-[1.5px] border-neutral-200 px-4 py-3 text-sm focus:border-primary-600 focus:outline-none"
            placeholder="Votre réponse…"
          />
        </div>
      ))}
    </div>
  );
}

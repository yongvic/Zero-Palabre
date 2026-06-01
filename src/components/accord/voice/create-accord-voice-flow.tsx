"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  MessageSquareText,
  Send,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceRecorderPanel } from "./voice-recorder-panel";
import { useMediaRecorder } from "@/hooks/use-media-recorder";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import type { VoiceAccordDraftPayload, VoiceMissingField } from "@/lib/voice-accord/types";
import type { CreateAccordInput } from "@/lib/validations/accord";
import { cn } from "@/lib/utils";

const TYPES = [
  { id: "PRET", label: "Prêt" },
  { id: "PRESTATION", label: "Prestation" },
  { id: "LOCATION", label: "Location" },
  { id: "COMMANDE", label: "Commande" },
  { id: "AUTRE", label: "Autre" },
] as const;

type Step = "consent" | "record" | "analyze" | "complete" | "preview";

type Props = {
  initiateurName: string;
  initiateurEmail: string;
};

export function CreateAccordVoiceFlow({ initiateurName, initiateurEmail }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("consent");
  const [consent, setConsent] = useState(false);
  const [session, setSession] = useState<VoiceAccordDraftPayload | null>(null);
  const [draft, setDraft] = useState<Partial<CreateAccordInput>>({ devise: "FCFA", type: "PRET" });
  const [manualText, setManualText] = useState("");
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const media = useMediaRecorder();
  const speech = useSpeechRecognition("fr-FR");
  const finalTranscript = (manualText || speech.displayText).trim();

  const uploadAudio = useCallback(
    async (audioBlob: Blob | null, sessionId?: string) => {
      if (!audioBlob) return;
      const fd = new FormData();
      fd.append("audio", audioBlob, "accord.webm");
      if (sessionId) fd.append("sessionId", sessionId);
      await fetch("/api/accords/voice/audio", { method: "POST", body: fd });
    },
    []
  );

  const analyze = useCallback(
    async (answers?: Record<string, string>) => {
      setStep("analyze");
      setError("");

      const res = await fetch("/api/accords/voice/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: finalTranscript,
          sessionId: session?.sessionId,
          textAnswers: answers,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Analyse impossible");
        setStep("record");
        return;
      }

      const data = json.data as VoiceAccordDraftPayload;
      setSession(data);
      setDraft((prev) => ({ ...prev, ...(data.draft as Partial<CreateAccordInput>) }));

      if (data.ready) {
        setStep("preview");
      } else {
        setStep("complete");
      }
    },
    [finalTranscript, session?.sessionId]
  );

  async function handleRecordNext() {
    if (media.recording) {
      setError("Terminez l'enregistrement avant d'analyser.");
      return;
    }
    if (finalTranscript.length < 15) {
      setError("Décrivez l'accord en une phrase plus complète (destinataire, objet, montant…).");
      return;
    }
    if (media.blob) await uploadAudio(media.blob, session?.sessionId);
    await analyze();
  }

  async function handleCompleteNext() {
    const missing = session?.missingFields ?? [];
    const empty = missing.filter((f) => !textAnswers[f.key]?.trim());
    if (empty.length > 0) {
      setError("Complétez les champs ou réenregistrez votre voix.");
      return;
    }
    await analyze(textAnswers);
  }

  async function handleSubmit() {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("Connexion Internet requise.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/accords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error?.message ?? "Erreur lors de la création");
      if (json.error?.code === "QUOTA_EXCEEDED") router.push("/abonnement");
      return;
    }
    router.push(`/accords/${json.data.id}`);
  }

  function startRecording() {
    setError("");
    setManualText("");
    speech.reset();
    media.reset();
    void media.start().then(() => speech.start());
  }

  function stopRecording() {
    speech.stop();
    media.stop();
    if (speech.displayText && !manualText) setManualText(speech.displayText);
  }

  const stepLabels = ["Préparer", "Parler", "Vérifier", "Envoyer"];
  const stepIdx =
    step === "consent" ? 0 : step === "record" || step === "analyze" ? 1 : step === "complete" ? 2 : 3;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "h-1.5 w-full rounded-full transition-colors",
                i <= stepIdx ? "bg-primary-600" : "bg-neutral-200"
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

      <AnimatePresence mode="wait">
        {step === "consent" && (
          <motion.div
            key="consent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-5">
              <p className="text-sm font-bold text-primary-900 mb-2">Créer un accord à la voix</p>
              <p className="text-xs text-neutral-700 leading-relaxed">
                Décrivez oralement votre accord : avec qui, pour quoi, combien, quand. L&apos;IA
                Gemini remplit le formulaire pour vous. Vous pourrez tout relire avant l&apos;envoi.
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Initiateur : <strong>{initiateurName}</strong> ({initiateurEmail})
              </p>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-primary-800"
              />
              <span className="text-sm text-neutral-800 leading-relaxed">
                J&apos;autorise l&apos;enregistrement et l&apos;analyse de ma voix pour générer cet
                accord.
              </span>
            </label>
            <Button className="w-full" disabled={!consent} onClick={() => setStep("record")}>
              Commencer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {step === "record" && (
          <motion.div
            key="record"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl bg-neutral-50 border border-neutral-150 p-4 text-xs text-neutral-600 leading-relaxed">
              <strong className="text-neutral-900">Exemple :</strong> « Je prête 200 000 FCFA à
              Ama Koffi, email ama@mail.com, remboursable avant le 30 juin 2026. C&apos;est un prêt
              entre amis pour son commerce. »
            </div>
            <VoiceRecorderPanel
              recording={media.recording}
              seconds={media.seconds}
              displayText={speech.displayText}
              speechSupported={speech.supported}
              manualText={manualText}
              onManualChange={setManualText}
              onStart={startRecording}
              onStop={stopRecording}
              hint="Décrivez le destinataire, l'objet, le montant, l'échéance…"
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep("consent")}>
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <Button
                className="flex-1"
                onClick={handleRecordNext}
                disabled={media.recording || !finalTranscript}
              >
                Analyser avec l&apos;IA
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === "analyze" && (
          <motion.div
            key="analyze"
            className="flex flex-col items-center py-16 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary-700" />
            <p className="text-sm font-semibold text-neutral-800">Gemini structure votre accord…</p>
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
              <p className="text-sm font-bold text-amber-900">Encore quelques détails</p>
              {session.summaryFr && (
                <p className="mt-2 text-xs italic text-amber-950/80">&laquo; {session.summaryFr} &raquo;</p>
              )}
            </div>
            <DraftMissingFields
              fields={session.missingFields}
              values={textAnswers}
              onChange={(k, v) => setTextAnswers((p) => ({ ...p, [k]: v }))}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" className="flex-1" onClick={() => setStep("record")}>
                <MessageSquareText className="h-4 w-4" />
                Compléter à la voix
              </Button>
              <Button className="flex-1" onClick={handleCompleteNext}>
                Continuer
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {session?.summaryFr && (
              <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-4 flex gap-3">
                <Sparkles className="h-5 w-5 text-primary-800 shrink-0" />
                <p className="text-sm text-neutral-800 leading-relaxed">{session.summaryFr}</p>
              </div>
            )}
            <DraftPreviewForm draft={draft} onChange={setDraft} />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep("record")}>
                Réenregistrer
              </Button>
              <Button className="flex-1 gap-2" loading={submitting} onClick={handleSubmit}>
                <Send className="h-4 w-4" />
                Envoyer l&apos;accord au destinataire
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DraftMissingFields({
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
          <Label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            {field.label}
          </Label>
          <p className="text-xs text-neutral-500">{field.question}</p>
          {field.key === "type" ? (
            <select
              value={values.type ?? ""}
              onChange={(e) => onChange("type", e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            >
              <option value="">Choisir…</option>
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          ) : field.key === "description" ? (
            <textarea
              value={values.description ?? ""}
              onChange={(e) => onChange("description", e.target.value)}
              className="min-h-[80px] w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
              placeholder="Votre réponse…"
            />
          ) : (
            <input
              type={field.key === "destinataireEmail" ? "email" : "text"}
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
              placeholder="Votre réponse…"
            />
          )}
        </div>
      ))}
    </div>
  );
}

function DraftPreviewForm({
  draft,
  onChange,
}: {
  draft: Partial<CreateAccordInput>;
  onChange: (d: Partial<CreateAccordInput>) => void;
}) {
  const set = (key: keyof CreateAccordInput, value: unknown) =>
    onChange({ ...draft, [key]: value });

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 p-5">
      <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
        <FileText className="h-4 w-4" />
        Aperçu — modifiable
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Type</Label>
          <select
            value={draft.type ?? "AUTRE"}
            onChange={(e) => set("type", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Titre</Label>
          <Input
            value={draft.titre ?? ""}
            onChange={(e) => set("titre", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Destinataire</Label>
          <Input
            value={draft.destinataireNom ?? ""}
            onChange={(e) => set("destinataireNom", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Email destinataire</Label>
          <Input
            type="email"
            value={draft.destinataireEmail ?? ""}
            onChange={(e) => set("destinataireEmail", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Montant (optionnel)</Label>
          <Input
            type="number"
            value={draft.montant ?? ""}
            onChange={(e) =>
              set("montant", e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Devise</Label>
          <select
            value={draft.devise ?? "FCFA"}
            onChange={(e) => set("devise", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm"
          >
            <option value="FCFA">FCFA</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Échéance (optionnel)</Label>
          <Input
            type="date"
            value={draft.dateEcheance?.slice(0, 10) ?? ""}
            onChange={(e) => set("dateEcheance", e.target.value || null)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Description</Label>
          <textarea
            value={draft.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            className="min-h-[100px] w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}

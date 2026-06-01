"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, Square, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  recording: boolean;
  seconds: number;
  displayText: string;
  speechSupported: boolean;
  manualText: string;
  onManualChange: (v: string) => void;
  onStart: () => void;
  onStop: () => void;
  hint?: string;
};

export function VoiceRecorderPanel({
  recording,
  seconds,
  displayText,
  speechSupported,
  manualText,
  onManualChange,
  onStart,
  onStop,
  hint,
}: Props) {
  const maxSeconds = 90;
  const progress = Math.min((seconds / maxSeconds) * 100, 100);

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary-100 bg-gradient-to-b from-primary-50/80 to-neutral-0 p-8">
        <div className="relative">
          {recording && (
            <>
              <motion.span
                className="absolute inset-0 rounded-full bg-primary-400/30"
                animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              />
              <motion.span
                className="absolute inset-0 rounded-full bg-primary-500/20"
                animate={{ scale: [1, 1.55, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.2, delay: 0.3 }}
              />
            </>
          )}
          <button
            type="button"
            onClick={recording ? onStop : onStart}
            className={cn(
              "relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-lg transition-all",
              recording
                ? "border-error-500 bg-error-50 text-error-700"
                : "border-primary-200 bg-primary-800 text-neutral-0 hover:bg-primary-700"
            )}
            aria-label={recording ? "Arrêter" : "Commencer l'enregistrement"}
          >
            {recording ? (
              <Square className="h-8 w-8 fill-current" />
            ) : (
              <Mic className="h-10 w-10" strokeWidth={1.5} />
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm font-bold text-neutral-900">
            {recording ? "Enregistrement en cours…" : "Appuyez pour parler"}
          </p>
          <p className="mt-1 text-xs text-neutral-500 tabular-nums">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
            {recording && ` / ${maxSeconds}s max`}
          </p>
        </div>

        {recording && (
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-neutral-200">
            <motion.div
              className="h-full bg-primary-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {!speechSupported && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <MicOff className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            La transcription instantanée n&apos;est pas disponible sur ce navigateur.
            Saisissez votre message ci-dessous ou utilisez Chrome / Edge sur ordinateur.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600">
          <Type className="h-3.5 w-3.5" />
          {speechSupported ? "Transcription (modifiable)" : "Votre message"}
        </label>
        <textarea
          value={manualText || displayText}
          onChange={(e) => onManualChange(e.target.value)}
          placeholder={
            hint ??
            "Ex. : Je m'appelle Kofi Mensah, j'accepte l'accord ZP-2026-00142 concernant la prestation…"
          }
          className="min-h-[120px] w-full resize-y rounded-xl border-[1.5px] border-neutral-200 bg-neutral-0 px-4 py-3 text-[15px] leading-relaxed focus:border-primary-600 focus:shadow-focus focus:outline-none"
        />
      </div>

      {recording && (
        <Button variant="outline" className="w-full" onClick={onStop}>
          Terminer l&apos;enregistrement
        </Button>
      )}
    </div>
  );
}

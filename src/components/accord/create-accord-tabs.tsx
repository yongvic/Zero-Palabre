"use client";

import { useState } from "react";
import { Mic, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateAccordForm } from "@/components/accord/create-accord-form";
import { CreateAccordVoiceFlow } from "@/components/accord/voice/create-accord-voice-flow";

type Mode = "voice" | "form";

type Props = {
  initiateurName: string;
  initiateurEmail: string;
  voiceEnabled: boolean;
};

export function CreateAccordTabs({
  initiateurName,
  initiateurEmail,
  voiceEnabled,
}: Props) {
  const [mode, setMode] = useState<Mode>(voiceEnabled ? "voice" : "form");

  return (
    <div className="space-y-8">
      {voiceEnabled && (
        <div className="flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
          <button
            type="button"
            onClick={() => setMode("voice")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
              mode === "voice"
                ? "bg-neutral-0 text-primary-800 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            )}
          >
            <Mic className="h-4 w-4" />
            Par la voix
          </button>
          <button
            type="button"
            onClick={() => setMode("form")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
              mode === "form"
                ? "bg-neutral-0 text-primary-800 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            )}
          >
            <ListOrdered className="h-4 w-4" />
            Formulaire
          </button>
        </div>
      )}

      {mode === "voice" && voiceEnabled ? (
        <CreateAccordVoiceFlow
          initiateurName={initiateurName}
          initiateurEmail={initiateurEmail}
        />
      ) : (
        <CreateAccordForm
          initiateurName={initiateurName}
          initiateurEmail={initiateurEmail}
        />
      )}
    </div>
  );
}

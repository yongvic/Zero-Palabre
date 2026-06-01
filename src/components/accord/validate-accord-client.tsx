"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, ArrowLeft, Ban, Mic, MousePointerClick } from "lucide-react";
import { VoiceSignatureFlow, type VoiceAccordProps } from "@/components/accord/voice/voice-signature-flow";
import { cn } from "@/lib/utils";

type Mode = "quick" | "voice";

type Props = VoiceAccordProps & {
  voiceEnabled?: boolean;
};

export function ValidateAccordClient({
  token,
  destinataireNom,
  titre,
  reference,
  voiceEnabled = true,
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(voiceEnabled ? "voice" : "quick");
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);

  async function handle(action: "accept" | "reject") {
    setLoading(true);
    const res = await fetch(`/api/accords/${token}/valider`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        commentaire:
          action === "reject"
            ? commentaire || "Accord refusé sans commentaire additionnel."
            : commentaire || undefined,
      }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="mt-2">
      {voiceEnabled && (
        <div className="mb-6 flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
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
            Signature vocale
          </button>
          <button
            type="button"
            onClick={() => setMode("quick")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
              mode === "quick"
                ? "bg-neutral-0 text-primary-800 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            )}
          >
            <MousePointerClick className="h-4 w-4" />
            Validation rapide
          </button>
        </div>
      )}

      {mode === "voice" && voiceEnabled ? (
        <VoiceSignatureFlow
          token={token}
          destinataireNom={destinataireNom}
          titre={titre}
          reference={reference}
        />
      ) : (
        <>
          {!showRejectReason ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                className="flex-1 min-h-[48px] text-[15px] font-bold tracking-tight rounded-xl bg-primary-800 hover:bg-primary-700 active:bg-primary-900 shadow-sm active:translate-y-px transition-all duration-150 gap-2 border-[1.5px] border-transparent"
                onClick={() => handle("accept")}
                loading={loading}
              >
                <CheckCircle className="h-5 w-5 shrink-0" strokeWidth={2} />
                J&apos;accepte cet accord
              </Button>

              <Button
                variant="outline"
                className="flex-1 min-h-[48px] text-[15px] font-semibold tracking-tight rounded-xl border-[1.5px] border-error-600 bg-transparent text-error-600 hover:bg-error-50 hover:border-error-800 active:bg-error-100 transition-all duration-150 gap-2"
                onClick={() => setShowRejectReason(true)}
                disabled={loading}
              >
                <Ban className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                Je refuse
              </Button>
            </div>
          ) : (
            <div className="page-enter space-y-5 rounded-xl border border-error-100 bg-error-50/30 p-5 md:p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-error-600 shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="text-sm font-bold text-error-800">
                    Confirmation de refus de l&apos;accord
                  </h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Afin de documenter précisément la raison de votre refus auprès de
                    l&apos;initiateur, veuillez expliquer ce qui ne convient pas dans les termes
                    proposés.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="commentaire"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-600 block"
                >
                  Motif du refus (conseillé)
                </Label>
                <textarea
                  id="commentaire"
                  placeholder="Ex: Le montant convenu est de 120 000 FCFA et non 150 000 FCFA..."
                  className="min-h-[100px] w-full resize-y rounded-xl border-[1.5px] border-neutral-200 bg-neutral-0 px-4 py-3 text-[15px] leading-relaxed focus:border-error-600 focus:shadow-focus-error focus:outline-none transition-all duration-150 placeholder:text-neutral-400"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  className="order-2 sm:order-1 min-h-[44px] px-5 text-sm font-semibold rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
                  onClick={() => {
                    setShowRejectReason(false);
                    setCommentaire("");
                  }}
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  Retour
                </Button>

                <Button
                  variant="danger"
                  className="order-1 sm:order-2 min-h-[44px] px-6 text-sm font-bold tracking-tight rounded-xl bg-error-600 hover:bg-error-700 active:bg-error-800 transition-all gap-2"
                  onClick={() => handle("reject")}
                  loading={loading}
                >
                  Confirmer le refus définitif
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

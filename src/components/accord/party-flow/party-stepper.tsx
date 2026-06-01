"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS = ["Identité", "Résumé", "Termes", "Modifs", "Engagement", "Terminé"];

export function PartyStepper({
  currentStep,
  skipAmendments,
}: {
  currentStep: number;
  skipAmendments?: boolean;
}) {
  const steps = skipAmendments
    ? LABELS.filter((_, i) => i !== 3)
    : LABELS;

  const displayStep =
    skipAmendments && currentStep > 4 ? currentStep - 1 : currentStep;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-1">
        {steps.map((label, i) => {
          const stepNum = skipAmendments && i >= 3 ? i + 2 : i + 1;
          const done = displayStep > i + 1;
          const active = displayStep === i + 1;

          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5 min-w-0">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                  done && "border-primary-600 bg-primary-600 text-neutral-0",
                  active && "border-primary-700 bg-primary-50 text-primary-800 scale-110 shadow-sm",
                  !done && !active && "border-neutral-200 bg-neutral-0 text-neutral-400"
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : stepNum}
              </div>
              <span
                className={cn(
                  "text-[9px] font-semibold uppercase tracking-wide text-center truncate w-full px-0.5",
                  active ? "text-primary-800" : "text-neutral-400"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full bg-primary-600 transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(100, ((displayStep - 1) / (steps.length - 1)) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

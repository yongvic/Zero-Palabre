"use client";

import { cn } from "@/lib/utils";

/** Orbes lumineux d'arrière-plan — une seule instance par layout */
export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
      aria-hidden
    >
      <div
        className="glow-ambient -left-[20%] top-[10%] h-[420px] w-[420px]"
        style={{ background: "oklch(0.42 0.1 165 / 0.25)" }}
      />
      <div
        className="glow-ambient right-[5%] top-[30%] h-[320px] w-[320px]"
        style={{ background: "oklch(0.55 0.14 75 / 0.12)" }}
      />
      <div
        className="glow-ambient bottom-[5%] left-[30%] h-[380px] w-[380px]"
        style={{ background: "oklch(0.25 0.04 250 / 0.2)" }}
      />
    </div>
  );
}

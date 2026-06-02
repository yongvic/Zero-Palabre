"use client";

import { cn } from "@/lib/utils";

/** Orbes d'ambiance — fond clair premium */
export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
      aria-hidden
    >
      <div
        className="glow-ambient -left-[15%] top-[5%] h-[380px] w-[380px]"
        style={{ background: "oklch(0.42 0.1 165 / 0.12)" }}
      />
      <div
        className="glow-ambient right-[0%] top-[25%] h-[280px] w-[280px]"
        style={{ background: "oklch(0.75 0.15 75 / 0.08)" }}
      />
      <div
        className="glow-ambient bottom-[10%] left-[35%] h-[320px] w-[320px]"
        style={{ background: "oklch(0.55 0.12 165 / 0.06)" }}
      />
    </div>
  );
}

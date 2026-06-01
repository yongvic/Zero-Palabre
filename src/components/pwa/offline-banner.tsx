"use client";

import Link from "next/link";
import { RefreshCw, WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Button } from "@/components/ui/button";

export function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div
      className="border-b border-amber-200 bg-amber-50 px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-semibold text-amber-900">Mode hors ligne</p>
            <p className="text-xs text-amber-800">
              Consultation des pages déjà visitées. Création et validation d&apos;accords
              indisponibles sans connexion.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="border-amber-300 bg-neutral-0"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
            Réessayer
          </Button>
          <Button size="sm" variant="ghost" asChild className="text-amber-900">
            <Link href="/accords">Mes accords</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

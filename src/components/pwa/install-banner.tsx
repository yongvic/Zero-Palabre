"use client";

import Link from "next/link";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallBanner({
  onInstall,
  onDismiss,
}: {
  onInstall: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-primary-200 bg-neutral-0 p-4 shadow-lg md:bottom-6"
      role="region"
      aria-label="Installer l'application"
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
      <p className="pr-8 text-sm font-semibold text-neutral-900">
        Installer Zéro-Palabre
      </p>
      <p className="mt-1 text-xs text-neutral-600">
        Accès rapide depuis votre écran d&apos;accueil — léger, sans store.
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={onInstall} className="flex-1">
          <Download className="h-4 w-4" strokeWidth={1.5} />
          Installer
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href="/installer">Guide</Link>
        </Button>
      </div>
    </div>
  );
}

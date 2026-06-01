"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function OfflineActions() {
  const online = useOnlineStatus();

  if (!online) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Réessayer la connexion
        </Button>
        <Button asChild>
          <Link href="/accords">Ouvrir mes accords (cache)</Link>
        </Button>
      </div>
    );
  }

  return (
    <Button className="mt-8" asChild>
      <Link href="/accords">Retour au tableau de bord</Link>
    </Button>
  );
}

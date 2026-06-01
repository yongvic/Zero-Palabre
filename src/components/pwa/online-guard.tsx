"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Button } from "@/components/ui/button";

export function OnlineGuard({
  children,
  action = "cette action",
}: {
  children: React.ReactNode;
  action?: string;
}) {
  const online = useOnlineStatus();

  if (online) return <>{children}</>;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
      <WifiOff className="mx-auto h-10 w-10 text-amber-700" strokeWidth={1.5} />
      <h2 className="mt-4 text-lg font-semibold text-amber-900">Connexion requise</h2>
      <p className="mt-2 text-sm text-amber-800">
        {action} nécessite Internet. Reconnectez-vous puis réessayez.
      </p>
      <Button className="mt-6" variant="secondary" asChild>
        <Link href="/accords">Retour aux accords</Link>
      </Button>
    </div>
  );
}

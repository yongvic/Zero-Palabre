import Image from "next/image";
import { WifiOff } from "lucide-react";
import { OfflineActions } from "./offline-client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center">
      <Image
        src="/brand/logo-vert.png"
        alt="Zéro-Palabre"
        width={140}
        height={36}
        className="mb-8"
      />
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
        <WifiOff className="h-8 w-8 text-primary-800" strokeWidth={1.5} />
      </div>
      <h1 className="text-heading-l text-neutral-900">Vous êtes hors ligne</h1>
      <p className="mt-3 max-w-sm text-sm text-neutral-600">
        Les pages du tableau de bord déjà visitées restent consultables en cache.
        La création et la validation d&apos;accords nécessitent une connexion Internet.
      </p>
      <OfflineActions />
    </div>
  );
}

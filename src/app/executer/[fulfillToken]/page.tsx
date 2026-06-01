export const dynamic = "force-dynamic";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { ExecuterWizard } from "@/components/accord/fulfillment/executer-wizard";

export default function ExecuterPage({
  params,
}: {
  params: { fulfillToken: string };
}) {
  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      <header className="sticky top-0 z-40 border-b border-neutral-150 bg-neutral-0/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Image src="/brand/logo-vert.png" alt="Zéro-Palabre" width={90} height={22} priority className="h-[22px] w-auto" />
          <div className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
            Exécution
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-10">
        <div className="rounded-2xl border border-neutral-150 bg-neutral-0 p-6 md:p-8 shadow-xs">
          <ExecuterWizard fulfillToken={params.fulfillToken} />
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccordQuotaStatus } from "@/lib/accord-quota";

export function QuotaBanner({ quota }: { quota: AccordQuotaStatus }) {
  if (!quota.canCreate) {
    return (
      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" strokeWidth={1.5} />
          <div>
            <p className="font-semibold text-amber-900">Limite d&apos;accords atteinte</p>
            <p className="mt-1 text-sm text-amber-800">
              Vous avez utilisé {quota.used} / {quota.limit} accords ({quota.periodLabel}).
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/abonnement">Voir les plans</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <p className="mb-6 text-sm text-neutral-600">
      Plan <span className="font-medium text-neutral-900">{quota.plan}</span> —{" "}
      {quota.remaining} accord{quota.remaining > 1 ? "s" : ""} restant
      {quota.remaining > 1 ? "s" : ""} sur {quota.limit} ({quota.periodLabel}).
    </p>
  );
}

import Link from "next/link";
import type { Accord } from "@/types/database";
import { Badge, statutToBadgeVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ACCORD_STATUT_LABELS, ACCORD_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatMontant } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export function AccordCard({ accord }: { accord: Accord }) {
  return (
    <Link href={`/accords/${accord.id}`}>
      <Card interactive className="block">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={statutToBadgeVariant(accord.statut)}>
                {ACCORD_STATUT_LABELS[accord.statut] ?? accord.statut}
              </Badge>
              <span className="text-xs text-neutral-500">{accord.reference}</span>
            </div>
            <h3 className="truncate font-semibold text-neutral-900">{accord.titre}</h3>
            <p className="mt-1 text-sm text-neutral-600">
              {ACCORD_TYPE_LABELS[accord.type]} · {accord.destinataireNom}
            </p>
            <p className="mt-2 text-sm font-medium text-primary-800">
              {formatMontant(
                accord.montant ? Number(accord.montant) : null,
                accord.devise
              )}
              {accord.dateEcheance && (
                <span className="ml-2 font-normal text-neutral-500">
                  · échéance {formatDate(accord.dateEcheance)}
                </span>
              )}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400" strokeWidth={1.5} />
        </div>
      </Card>
    </Link>
  );
}

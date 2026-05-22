"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Accord } from "@/types/database";
import { Badge, statutToBadgeVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ACCORD_STATUT_LABELS, ACCORD_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatMontant } from "@/lib/utils";
import { ChevronRight, Calendar, User as UserIcon } from "lucide-react";

export function AccordCard({
  accord,
  currentUserId,
}: {
  accord: Accord & { initiateur?: { name: string | null } };
  currentUserId?: string;
}) {
  const isInitiator = !currentUserId || accord.initiateurId === currentUserId;
  const partnerName = isInitiator
    ? accord.destinataireNom
    : (accord.initiateur?.name ?? "Utilisateur");

  return (
    <Link href={`/accords/${accord.id}`} className="group">
      <Card interactive className="p-0 overflow-hidden border-neutral-200/50 shadow-sm hover:shadow-premium">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={statutToBadgeVariant(accord.statut)}>
              {ACCORD_STATUT_LABELS[accord.statut] ?? accord.statut}
            </Badge>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              {accord.reference}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight text-neutral-900 group-hover:text-primary-700 transition-colors">
              {accord.titre}
            </h3>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span className="font-medium text-neutral-700">{ACCORD_TYPE_LABELS[accord.type]}</span>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">{partnerName}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-end justify-between">
            <div className="space-y-1">
              <p className="font-mono text-xl font-bold tracking-tight text-primary-700">
                {formatMontant(
                  accord.montant ? Number(accord.montant) : null,
                  accord.devise
                )}
              </p>
              {accord.dateEcheance && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
                  <Calendar className="h-3 w-3" />
                  <span>Échéance {formatDate(accord.dateEcheance)}</span>
                </div>
              )}
            </div>
            <div className="rounded-full bg-neutral-50 p-2 text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        
        {/* Visual accent - subtle bottom bar */}
        <div className={cn(
          "h-1 w-full opacity-20",
          accord.statut === 'ACCEPTED' ? "bg-success-600" :
          accord.statut === 'PENDING' ? "bg-amber-500" :
          "bg-primary-600"
        )} />
      </Card>
    </Link>
  );
}


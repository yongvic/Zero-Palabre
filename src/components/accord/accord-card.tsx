"use client";

import Link from "next/link";
import { cn, formatDate, formatMontant, statutToBadgeVariant } from "@/lib/utils";
import type { Accord } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ACCORD_STATUT_LABELS, ACCORD_TYPE_LABELS } from "@/lib/constants";
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
    <Link href={`/accords/${accord.id}`} className="group block">
      <Card interactive variant="light" className="overflow-hidden p-0">
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <Badge variant={statutToBadgeVariant(accord.statut)}>
              {ACCORD_STATUT_LABELS[accord.statut] ?? accord.statut}
            </Badge>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              {accord.reference}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight text-neutral-950 transition-colors group-hover:text-primary-700">
              {accord.titre}
            </h3>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span className="font-medium">{ACCORD_TYPE_LABELS[accord.type]}</span>
              <span className="text-neutral-300">·</span>
              <div className="flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5" />
                <span className="max-w-[120px] truncate">{partnerName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between pt-2">
            <div className="space-y-1">
              <p className="font-mono text-xl font-bold tracking-tight text-primary-700">
                {formatMontant(
                  accord.montant ? Number(accord.montant) : null,
                  accord.devise
                )}
              </p>
              {accord.dateEcheance && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                  <Calendar className="h-3 w-3" />
                  <span>Échéance {formatDate(accord.dateEcheance)}</span>
                </div>
              )}
            </div>
            <div className="rounded-full border border-neutral-200/60 bg-white/50 p-2 text-neutral-400 transition-all group-hover:border-primary-200/60 group-hover:text-primary-600">
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div
          className={cn(
            "h-0.5 w-full",
            accord.statut === "ACCEPTED" || accord.statut === "HONORED"
              ? "bg-success-600/60"
              : accord.statut === "OVERDUE"
                ? "bg-amber-500/70"
                : "bg-primary-500/50"
          )}
        />
      </Card>
    </Link>
  );
}

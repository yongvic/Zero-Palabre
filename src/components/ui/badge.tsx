"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
  {
    variants: {
      variant: {
        pending: "border-amber-500/20 bg-amber-500/10 text-amber-500",
        sent: "border-info-600/20 bg-info-600/10 text-info-600",
        viewed: "border-primary-400/20 bg-primary-400/10 text-primary-500",
        accepted: "border-success-600/20 bg-success-600/10 text-success-600",
        rejected: "border-error-600/20 bg-error-600/10 text-error-600",
        expired: "border-neutral-400/20 bg-neutral-400/10 text-neutral-500",
        honored: "border-primary-600/20 bg-primary-600/10 text-primary-700",
        disputed: "border-error-600/30 bg-error-600/20 text-error-800",
        default: "border-neutral-200 bg-neutral-100 text-neutral-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  children,
  dot = true,
}: VariantProps<typeof badgeVariants> & {
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {dot && (
        <span
          className="h-1 w-1 shrink-0 rounded-full bg-current"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export function statutToBadgeVariant(
  statut: string
): VariantProps<typeof badgeVariants>["variant"] {
  const map: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
    PENDING: "pending",
    SENT: "sent",
    VIEWED: "viewed",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    EXPIRED: "expired",
    HONORED: "honored",
    DISPUTED: "disputed",
  };
  return map[statut] ?? "default";
}


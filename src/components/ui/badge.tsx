import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        pending: "border-amber-200 bg-amber-50 text-amber-600",
        sent: "border-info-100 bg-info-50 text-info-600",
        viewed: "border-[#DDD8F5] bg-[#F3F0FA] text-[#5B4B8A]",
        accepted: "border-success-100 bg-success-50 text-success-600",
        rejected: "border-error-100 bg-error-50 text-error-600",
        expired: "border-neutral-200 bg-neutral-75 text-neutral-600",
        honored: "border-primary-200 bg-primary-50 text-primary-800",
        disputed: "border-amber-200 bg-[#FEF3E9] text-amber-700",
        default: "border-neutral-200 bg-neutral-100 text-neutral-700",
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
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80"
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

import type { Plan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/constants";

export type AccordQuotaStatus = {
  plan: Plan;
  limit: number;
  used: number;
  remaining: number;
  canCreate: boolean;
  periodLabel: string;
};

function getBillingPeriodStart(currentPeriodEnd: Date | null | undefined): Date {
  if (currentPeriodEnd) {
    return new Date(currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/** Compte réel des accords initiés — source de vérité pour les quotas */
export async function getAccordQuota(userId: string): Promise<AccordQuotaStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    return {
      plan: "FREE",
      limit: PLAN_LIMITS.FREE,
      used: 0,
      remaining: PLAN_LIMITS.FREE,
      canCreate: true,
      periodLabel: "plan gratuit",
    };
  }

  const plan = user.subscription?.plan ?? "FREE";
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;

  const where: { initiateurId: string; createdAt?: { gte: Date } } = {
    initiateurId: userId,
  };

  let periodLabel = "plan gratuit (total)";

  if (plan !== "FREE") {
    const periodStart = getBillingPeriodStart(
      user.subscription?.currentPeriodEnd
    );
    where.createdAt = { gte: periodStart };
    periodLabel = "période d'abonnement en cours";
  }

  const used = await prisma.accord.count({ where });
  const remaining = Math.max(0, limit - used);

  if (plan === "FREE" && used !== user.freeAccordsUsed) {
    await prisma.user.update({
      where: { id: userId },
      data: { freeAccordsUsed: used },
    });
  }

  return {
    plan,
    limit,
    used,
    remaining,
    canCreate: used < limit,
    periodLabel,
  };
}

export function quotaExceededMessage(quota: AccordQuotaStatus): string {
  if (quota.plan === "FREE") {
    return `Limite atteinte : ${quota.limit} accords gratuits. Passez à un plan payant pour continuer.`;
  }
  return `Limite atteinte : ${quota.limit} accords pour la ${quota.periodLabel}. Renouvelez ou changez de plan.`;
}

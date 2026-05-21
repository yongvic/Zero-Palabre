import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const checkoutSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "BUSINESS"]),
});

/** MVP : simulation Tmoney-Moov — active le plan directement en base */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  try {
    const { plan } = checkoutSchema.parse(await req.json());

    if (process.env.PAYMENT_MODE === "simulation") {
      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          plan,
          status: "active",
          paymentSubId: `sim_${plan}_${Date.now()}`,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        update: {
          plan,
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { subscriptionStatus: "ACTIVE" },
      });

      return NextResponse.json({
        data: { simulated: true, plan },
      });
    }

    return NextResponse.json({
      data: {
        checkoutUrl: `/abonnement?pending=${plan}`,
      },
    });
  } catch {
    return NextResponse.json({ error: { message: "Plan invalide" } }, { status: 400 });
  }
}

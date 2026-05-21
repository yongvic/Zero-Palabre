import { NextResponse } from "next/server";
import { addHours } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAccordSchema } from "@/lib/validations/accord";
import { generateAccordReference } from "@/lib/accord-reference";
import { FREE_ACCORD_LIMIT, INVITE_EXPIRY_HOURS } from "@/lib/constants";
import { accordInviteEmail } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/resend";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  const accords = await prisma.accord.findMany({
    where: { initiateurId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: accords });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const input = createAccordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: { message: "Utilisateur introuvable" } }, { status: 404 });
    }

    const plan = user.subscription?.plan ?? "FREE";
    const limit =
      plan === "FREE"
        ? FREE_ACCORD_LIMIT
        : plan === "STARTER"
          ? 20
          : plan === "PRO"
            ? 100
            : 9999;

    if (user.freeAccordsUsed >= limit && plan === "FREE") {
      return NextResponse.json(
        {
          error: {
            code: "QUOTA_EXCEEDED",
            message: "Limite d'accords gratuits atteinte. Passez à un plan payant.",
          },
        },
        { status: 403 }
      );
    }

    const reference = await generateAccordReference();
    const inviteExpiresAt = addHours(new Date(), INVITE_EXPIRY_HOURS);

    const accord = await prisma.accord.create({
      data: {
        reference,
        titre: input.titre,
        description: input.description,
        type: input.type,
        montant: input.montant ?? null,
        devise: input.devise,
        dateEcheance: input.dateEcheance
          ? new Date(input.dateEcheance)
          : null,
        destinataireNom: input.destinataireNom,
        destinataireEmail: input.destinataireEmail,
        initiateurId: session.user.id,
        statut: "SENT",
        sentAt: new Date(),
        inviteExpiresAt,
      },
    });

    await prisma.accordEvent.createMany({
      data: [
        { accordId: accord.id, type: "CREATED" },
        { accordId: accord.id, type: "SENT" },
      ],
    });

    if (plan === "FREE") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { freeAccordsUsed: { increment: 1 } },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const validationUrl = `${baseUrl}/valider/${accord.publicToken}`;

    await sendTransactionalEmail({
      to: input.destinataireEmail,
      subject: `[Zéro-Palabre] Accord à valider : ${input.titre}`,
      html: accordInviteEmail({
        initiateurName: user.name ?? "Un utilisateur",
        titre: input.titre,
        validationUrl,
      }),
    });

    return NextResponse.json({ data: accord });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: { message: "Données invalides ou erreur serveur" } },
      { status: 400 }
    );
  }
}

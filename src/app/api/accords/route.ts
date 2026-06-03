import { NextResponse } from "next/server";
import { addHours } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAccordSchema } from "@/lib/validations/accord";
import { generateAccordReference } from "@/lib/accord-reference";
import { INVITE_EXPIRY_HOURS } from "@/lib/constants";
import { getAccordQuota, quotaExceededMessage } from "@/lib/accord-quota";
import { accordInviteEmail } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/resend";
import { normalizeUsername } from "@/lib/username";

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

    const quota = await getAccordQuota(session.user.id);

    if (!quota.canCreate) {
      return NextResponse.json(
        {
          error: {
            code: "QUOTA_EXCEEDED",
            message: quotaExceededMessage(quota),
            quota,
          },
        },
        { status: 403 }
      );
    }

    const plan = quota.plan;

    const reference = await generateAccordReference();
    const useNotarialFlow = !!input.counterpartyUsername?.trim();

    let destinataireUser: { id: string; email: string; name: string | null } | null = null;

    if (useNotarialFlow) {
      const username = normalizeUsername(input.counterpartyUsername!);
      destinataireUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true, email: true, name: true },
      });
      if (!destinataireUser) {
        return NextResponse.json(
          { error: { message: "Contrepartie @id introuvable" } },
          { status: 404 }
        );
      }
      if (destinataireUser.id === session.user.id) {
        return NextResponse.json(
          { error: { message: "Vous ne pouvez pas créer un accord avec vous-même" } },
          { status: 400 }
        );
      }
      if (input.type === "PRET" && !input.montant) {
        return NextResponse.json(
          { error: { message: "Montant requis pour un prêt notarial" } },
          { status: 400 }
        );
      }
      if (input.type === "PRET" && !input.repaymentMode) {
        return NextResponse.json(
          { error: { message: "Mode de remboursement requis" } },
          { status: 400 }
        );
      }
      if (
        !user.username ||
        !user.dateOfBirth ||
        !user.address ||
        !user.name
      ) {
        return NextResponse.json(
          { error: { message: "Complétez votre profil (@id, adresse, date de naissance) avant de créer un accord notarial." } },
          { status: 400 }
        );
      }
    }

    const inviteExpiresAt = useNotarialFlow ? null : addHours(new Date(), INVITE_EXPIRY_HOURS);

    const existingDest = useNotarialFlow
      ? destinataireUser
      : await prisma.user.findUnique({
          where: { email: input.destinataireEmail },
          select: { id: true, email: true, name: true },
        });

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
        destinataireNom: useNotarialFlow
          ? (destinataireUser!.name ?? input.destinataireNom ?? "Contrepartie")
          : input.destinataireNom!,
        destinataireEmail: useNotarialFlow
          ? destinataireUser!.email
          : input.destinataireEmail!,
        destinataireId: existingDest?.id ?? null,
        counterpartyUsername: useNotarialFlow
          ? normalizeUsername(input.counterpartyUsername!)
          : null,
        repaymentMode: input.repaymentMode ?? null,
        initiateurId: session.user.id,
        statut: useNotarialFlow ? "AWAITING_INITIATOR_SIGN" : "SENT",
        sentAt: useNotarialFlow ? null : new Date(),
        inviteExpiresAt,
      },
    });

    await prisma.accordEvent.createMany({
      data: useNotarialFlow
        ? [{ accordId: accord.id, type: "CREATED" }]
        : [
            { accordId: accord.id, type: "CREATED" },
            { accordId: accord.id, type: "SENT" },
          ],
    });

    if (plan === "FREE") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { freeAccordsUsed: quota.used + 1 },
      });
    }

    if (!useNotarialFlow) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const validationUrl = `${baseUrl}/valider/${accord.publicToken}`;

      await sendTransactionalEmail({
        to: input.destinataireEmail!,
        subject: `[Zéro-Palabre] Accord à valider : ${input.titre}`,
        html: accordInviteEmail({
          initiateurName: user.name ?? "Un utilisateur",
          titre: input.titre,
          validationUrl,
        }),
      });
    }

    return NextResponse.json({
      data: accord,
      notarialFlow: useNotarialFlow,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: { message: "Données invalides ou erreur serveur" } },
      { status: 400 }
    );
  }
}

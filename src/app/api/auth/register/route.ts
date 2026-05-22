import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { registerSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: { code: "EMAIL_EXISTS", message: "Cet email est déjà utilisé." } },
        { status: 409 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone ?? null,
        password: hashedPassword,
        cguAcceptedAt: new Date(),
        kycStatus: "NONE",
        emailVerified: new Date(), // compte directement vérifié par le mot de passe
      },
    });

    // Créer le score de fiabilité, l'abonnement gratuit, et lier les accords existants
    await Promise.all([
      prisma.reliabilityScore.create({
        data: { userId: user.id },
      }),
      prisma.subscription.create({
        data: { userId: user.id, plan: "FREE" },
      }),
      prisma.accord.updateMany({
        where: { destinataireEmail: user.email },
        data: { destinataireId: user.id },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: err.errors[0]?.message ?? "Données invalides" } },
        { status: 400 }
      );
    }
    console.error("[register]", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Erreur serveur" } },
      { status: 500 }
    );
  }
}


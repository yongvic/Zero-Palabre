import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileIdentitySchema } from "@/lib/validations/profile-identity";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = profileIdentitySchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { username: data.username },
      select: { id: true },
    });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { error: { message: "Cet identifiant est déjà pris" } },
        { status: 409 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: data.username,
        familyName: data.familyName ?? undefined,
        dateOfBirth: new Date(data.dateOfBirth),
        address: data.address,
        phone: data.phone ?? undefined,
      },
      select: {
        username: true,
        familyName: true,
        dateOfBirth: true,
        address: true,
        phone: true,
      },
    });

    return NextResponse.json({ data: user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: { message: err.errors[0]?.message ?? "Données invalides" } },
        { status: 400 }
      );
    }
    console.error("[profile/identity]", err);
    return NextResponse.json({ error: { message: "Erreur serveur" } }, { status: 500 });
  }
}

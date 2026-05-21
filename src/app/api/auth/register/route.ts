import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    await prisma.user.upsert({
      where: { email: data.email },
      create: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        cguAcceptedAt: new Date(),
        kycStatus: "NONE",
      },
      update: {
        name: data.name,
        phone: data.phone,
        cguAcceptedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: { message: "Données invalides" } },
      { status: 400 }
    );
  }
}

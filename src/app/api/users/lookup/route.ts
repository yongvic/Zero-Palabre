import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeUsername, formatUsernameDisplay } from "@/lib/username";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("username");
  if (!raw) {
    return NextResponse.json({ error: { message: "username requis" } }, { status: 400 });
  }

  const username = normalizeUsername(raw);
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, username: true, image: true },
  });

  if (!user || user.id === session.user.id) {
    return NextResponse.json({ error: { message: "Utilisateur introuvable" } }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      id: user.id,
      name: user.name,
      username: user.username ? formatUsernameDisplay(user.username) : null,
      image: user.image,
    },
  });
}

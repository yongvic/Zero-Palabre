import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markNotificationRead } from "@/lib/notifications/store";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  const result = await markNotificationRead(params.id, session.user.id);
  if (result.count === 0) {
    return NextResponse.json({ error: { message: "Notification introuvable" } }, { status: 404 });
  }

  return NextResponse.json({ data: { ok: true } });
}

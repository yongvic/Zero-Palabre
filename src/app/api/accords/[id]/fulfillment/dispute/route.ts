import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { disputeSchema } from "@/lib/fulfillment/types";
import { openDispute } from "@/lib/fulfillment/dispute";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  try {
    const { reason } = disputeSchema.parse(await req.json());
    const result = await openDispute(params.id, session.user.id, reason);
    return NextResponse.json({ data: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const errors: Record<string, string> = {
      ACCORD_NOT_FOUND: "Accord introuvable.",
      NOT_PARTY: "Vous n'êtes pas partie à cet accord.",
      NOT_ELIGIBLE: "Litige non disponible pour cet accord.",
    };
    return NextResponse.json(
      { error: { message: errors[msg] ?? "Litige impossible." } },
      { status: 400 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { findAccordForParty } from "@/lib/party-session/accord-route";
import { buildTermFields, accordToSnapshot } from "@/lib/party-session/terms";
import { completePartySession } from "@/lib/party-session/complete";
import { assertPartySessionCompletable } from "@/lib/party-session/session";
import { namesMatch } from "@/lib/party-session/match";

const bodySchema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await findAccordForParty(params.id);
    if (!result?.accord || result.error) {
      return NextResponse.json(
        { error: { message: "Accord non disponible" } },
        { status: 409 }
      );
    }

    const { sessionId } = bodySchema.parse(await req.json());
    const snapshot = accordToSnapshot(result.accord);
    const termKeys = buildTermFields(snapshot).map((t) => t.key);

    const { session, fieldResponses } = await assertPartySessionCompletable(
      sessionId,
      result.accord.id,
      termKeys
    );

    if (!namesMatch(session.signatureName, result.accord.destinataireNom)) {
      return NextResponse.json(
        {
          error: {
            message:
              "La signature doit correspondre au nom du destinataire indiqué sur l'invitation.",
          },
        },
        { status: 400 }
      );
    }

    const { verifyUrl } = await completePartySession({
      sessionId,
      accordId: result.accord.id,
      termKeys,
    });

    return NextResponse.json({
      data: { verifyUrl, hasAmendments: Object.values(fieldResponses).some((r) => r.action === "amended") },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const errors: Record<string, string> = {
      SESSION_NOT_FOUND: "Session introuvable.",
      SESSION_EXPIRED: "Session expirée.",
      SESSION_NOT_ACTIVE: "Session déjà finalisée.",
      IDENTITY_INCOMPLETE: "Identité non confirmée.",
      CGU_NOT_ACCEPTED: "Acceptez les conditions pour continuer.",
      SIGNATURE_MISSING: "Signature requise.",
    };
    if (msg.startsWith("TERM_MISSING:")) {
      return NextResponse.json(
        { error: { message: "Tous les termes doivent être validés avant de finaliser." } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { message: errors[msg] ?? "Finalisation impossible." } },
      { status: 400 }
    );
  }
}

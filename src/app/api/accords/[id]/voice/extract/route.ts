import { NextResponse } from "next/server";
import { z } from "zod";
import { isDeepSeekConfigured } from "@/lib/deepseek/client";
import { findAccordForVoice } from "@/lib/voice-signature/accord-route";
import {
  accordToVoiceContext,
  processVoiceTranscript,
} from "@/lib/voice-signature/session";
import { voiceIntentSchema } from "@/lib/voice-signature/types";

const bodySchema = z.object({
  transcript: z.string().min(1).max(8000),
  intent: voiceIntentSchema,
  sessionId: z.string().optional(),
  textAnswers: z.record(z.string(), z.string()).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isDeepSeekConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: "DEEPSEEK_NOT_CONFIGURED",
          message:
            "La signature vocale nécessite DEEPSEEK_API_KEY dans les variables d'environnement.",
        },
      },
      { status: 503 }
    );
  }

  try {
    const body = bodySchema.parse(await req.json());
    const result = await findAccordForVoice(params.id);

    if (!result) {
      return NextResponse.json({ error: { message: "Accord introuvable" } }, { status: 404 });
    }
    if (result.error === "EXPIRED") {
      return NextResponse.json({ error: { message: "Lien expiré" } }, { status: 410 });
    }
    if (result.error === "ALREADY_PROCESSED") {
      return NextResponse.json(
        { error: { message: "Cet accord a déjà été traité" } },
        { status: 409 }
      );
    }

    const context = accordToVoiceContext(result.accord);

    const { payload } = await processVoiceTranscript({
      accordId: result.accord.id,
      sessionId: body.sessionId,
      transcript: body.transcript,
      intent: body.intent,
      context,
      textAnswers: body.textAnswers,
    });

    return NextResponse.json({ data: payload });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    if (message === "TRANSCRIPT_TOO_SHORT") {
      return NextResponse.json(
        {
          error: {
            message:
              "Parlez un peu plus longtemps (au moins une phrase complète) ou complétez le texte.",
          },
        },
        { status: 400 }
      );
    }
    if (message === "SESSION_EXPIRED") {
      return NextResponse.json(
        { error: { message: "Session expirée. Recommencez l'enregistrement." } },
        { status: 410 }
      );
    }
    console.error("[voice/extract]", e);
    return NextResponse.json(
      { error: { message: "Analyse vocale impossible. Réessayez." } },
      { status: 500 }
    );
  }
}

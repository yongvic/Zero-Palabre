import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isDeepSeekConfigured } from "@/lib/deepseek/client";
import { processVoiceAccordTranscript } from "@/lib/voice-accord/session";

const bodySchema = z.object({
  transcript: z.string().min(1).max(12000),
  sessionId: z.string().optional(),
  textAnswers: z.record(z.string(), z.string()).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  if (!isDeepSeekConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: "DEEPSEEK_NOT_CONFIGURED",
          message: "Ajoutez DEEPSEEK_API_KEY pour créer un accord à la voix.",
        },
      },
      { status: 503 }
    );
  }

  try {
    const body = bodySchema.parse(await req.json());
    const { payload } = await processVoiceAccordTranscript({
      userId: session.user.id,
      sessionId: body.sessionId,
      transcript: body.transcript,
      initiateur: {
        name: session.user.name ?? "Utilisateur",
        email: session.user.email ?? "",
      },
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
              "Décrivez votre accord plus en détail (destinataire, montant, objet, échéance…).",
          },
        },
        { status: 400 }
      );
    }
    if (message === "SESSION_EXPIRED") {
      return NextResponse.json(
        { error: { message: "Session expirée. Recommencez." } },
        { status: 410 }
      );
    }
    console.error("[accords/voice/extract]", e);
    return NextResponse.json(
      { error: { message: "Analyse impossible. Réessayez." } },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { findAccordForVoice } from "@/lib/voice-signature/accord-route";
import { getOrCreateVoiceSession } from "@/lib/voice-signature/session";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await findAccordForVoice(params.id);
    if (!result?.accord) {
      return NextResponse.json({ error: { message: "Accord introuvable" } }, { status: 404 });
    }
    if (result.error) {
      return NextResponse.json(
        { error: { message: "Accord non modifiable" } },
        { status: 409 }
      );
    }

    const form = await req.formData();
    const file = form.get("audio");
    const sessionId = form.get("sessionId")?.toString();

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: { message: "Fichier audio manquant" } }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: { message: "Enregistrement trop volumineux (max 5 Mo)" } },
        { status: 400 }
      );
    }

    const session = await getOrCreateVoiceSession(result.accord.id, sessionId);

    let audioUrl: string | null = null;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(
        `voice/${result.accord.reference}/${session.sessionId}-${Date.now()}.webm`,
        file,
        { access: "public", contentType: file.type || "audio/webm" }
      );
      audioUrl = blob.url;
    }

    const urls = Array.isArray(session.audioUrls) ? [...(session.audioUrls as string[])] : [];
    if (audioUrl) urls.push(audioUrl);

    await prisma.voiceSignatureSession.update({
      where: { id: session.id },
      data: { audioUrls: urls as Prisma.InputJsonValue },
    });

    return NextResponse.json({
      data: { sessionId: session.sessionId, audioUrl },
    });
  } catch (e) {
    console.error("[voice/audio]", e);
    return NextResponse.json({ error: { message: "Upload audio échoué" } }, { status: 500 });
  }
}

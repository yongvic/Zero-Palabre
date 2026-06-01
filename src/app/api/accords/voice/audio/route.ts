import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { getOrCreateVoiceAccordDraft } from "@/lib/voice-accord/session";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  try {
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

    const draftSession = await getOrCreateVoiceAccordDraft(
      session.user.id,
      sessionId
    );

    let audioUrl: string | null = null;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(
        `voice-draft/${session.user.id}/${draftSession.sessionId}-${Date.now()}.webm`,
        file,
        { access: "public", contentType: file.type || "audio/webm" }
      );
      audioUrl = blob.url;
    }

    const urls = Array.isArray(draftSession.audioUrls)
      ? [...(draftSession.audioUrls as string[])]
      : [];
    if (audioUrl) urls.push(audioUrl);

    await prisma.voiceAccordDraft.update({
      where: { id: draftSession.id },
      data: { audioUrls: urls as Prisma.InputJsonValue },
    });

    return NextResponse.json({
      data: { sessionId: draftSession.sessionId, audioUrl },
    });
  } catch (e) {
    console.error("[accords/voice/audio]", e);
    return NextResponse.json({ error: { message: "Upload audio échoué" } }, { status: 500 });
  }
}

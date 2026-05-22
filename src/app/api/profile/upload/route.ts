import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté. Utilisez JPG, PNG, WebP ou GIF." }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)" }, { status: 400 });
    }

    let imageUrl: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Vercel Blob storage (production)
      const { put } = await import("@vercel/blob");
      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `avatars/${session.user.id}-${Date.now()}.${ext}`;
      const blob = await put(filename, file.stream(), {
        access: "public",
        contentType: file.type,
      });
      imageUrl = blob.url;
    } else {
      // Local fallback for development
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `${session.user.id}-${Date.now()}.${ext}`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(path.join(uploadsDir, filename), buffer);
      imageUrl = `/uploads/avatars/${filename}`;
    }

    // Update user's image in DB
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    // Return absolute URL for local dev to avoid relative path issues
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const finalUrl = imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`;
    return NextResponse.json({ data: { imageUrl: finalUrl } });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}

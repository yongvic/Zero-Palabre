import { NextResponse } from "next/server";
import { getFulfillmentByToken } from "@/lib/fulfillment/record";

const MAX_FILE_BYTES = 1_500_000;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(
  req: Request,
  { params }: { params: { fulfillToken: string } }
) {
  const row = await getFulfillmentByToken(params.fulfillToken);
  if (!row) {
    return NextResponse.json({ error: { message: "Lien introuvable" } }, { status: 404 });
  }

  if (!["ACCEPTED", "OVERDUE"].includes(row.accord.statut)) {
    return NextResponse.json(
      { error: { message: "Cet accord n'accepte plus de déclaration" } },
      { status: 409 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: { message: "Fichier manquant" } }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: { message: "Format non supporté (JPG, PNG, WebP, GIF)." } },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: { message: "Image trop volumineuse (max 1.5 Mo)." } },
      { status: 400 }
    );
  }

  let proofUrl: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const filename = `fulfillment-proofs/${row.accordId}-${Date.now()}.${ext}`;
    const blob = await put(filename, file.stream(), {
      access: "public",
      contentType: file.type,
    });
    proofUrl = blob.url;
  } else {
    const { mkdir, writeFile } = await import("fs/promises");
    const path = await import("path");

    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const filename = `${row.accordId}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "fulfillment-proofs");
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    proofUrl = `${baseUrl}/uploads/fulfillment-proofs/${filename}`;
  }

  return NextResponse.json({ data: { proofUrl, contentType: file.type, size: file.size } });
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateNotarialAct } from "@/lib/notarial/generate-act";
import { generateNotarialPdfBuffer } from "@/lib/generate-notarial-pdf";
import type { NotarialFilledFields } from "@/lib/notarial/build-fields";
import path from "path";
import fs from "fs";

const NOTARY_CAPTION = "Cachet notarial — template validé · République Togolaise";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  const accord = await prisma.accord.findFirst({
    where: {
      id: params.id,
      OR: [{ initiateurId: session.user.id }, { destinataireId: session.user.id }],
      statut: {
        in: [
          "DUAL_SIGNED",
          "ESCROW_FUNDED",
          "ACTIVE",
          "REPAYING",
          "ACCEPTED",
          "HONORED",
          "OVERDUE",
          "DISPUTED",
        ],
      },
    },
    include: { notarialAct: { include: { template: true } } },
  });

  if (!accord) {
    return NextResponse.json({ error: { message: "Acte non disponible" } }, { status: 404 });
  }

  const actRecord =
    accord.notarialAct ??
    (await prisma.accordNotarialAct.findUnique({
      where: { accordId: accord.id },
      include: { template: true },
    })) ??
    (await (async () => {
      await generateNotarialAct(accord.id);
      return prisma.accordNotarialAct.findUniqueOrThrow({
        where: { accordId: accord.id },
        include: { template: true },
      });
    })());

  const template = actRecord.template;

  const stampPath = template?.stampUrl?.startsWith("/")
    ? path.join(process.cwd(), "public", template.stampUrl.replace(/^\//, ""))
    : path.join(process.cwd(), "public", "brand", "logo-vert.png");

  let stampSrc = stampPath;
  if (fs.existsSync(stampPath)) {
    const buf = fs.readFileSync(stampPath);
    const ext = path.extname(stampPath).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
    stampSrc = `data:${mime};base64,${buf.toString("base64")}`;
  }

  const fields = actRecord.filledFields as NotarialFilledFields;

  const buffer = await generateNotarialPdfBuffer({
    fields,
    stampSrc,
    notaryCaption: NOTARY_CAPTION,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${accord.reference}-acte-notarial.pdf"`,
    },
  });
}

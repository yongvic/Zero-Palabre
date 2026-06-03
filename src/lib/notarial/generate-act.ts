import { prisma } from "@/lib/prisma";
import { getActiveTemplate } from "./template";
import { buildNotarialFields, hashNotarialFields } from "./build-fields";

export async function generateNotarialAct(accordId: string) {
  const accord = await prisma.accord.findUnique({
    where: { id: accordId },
    include: {
      initiateur: true,
      destinataire: true,
      signatures: true,
      notarialAct: true,
    },
  });

  if (!accord?.destinataire) {
    throw new Error("Contrepartie manquante");
  }

  if (accord.notarialAct) return accord.notarialAct;

  const template = await getActiveTemplate(accord.type);
  const filledFields = buildNotarialFields({
    accord,
    initiateur: accord.initiateur,
    contrepartie: accord.destinataire,
    signatures: accord.signatures,
    templateVersion: template.version,
  });
  const contentHash = hashNotarialFields(filledFields);

  return prisma.accordNotarialAct.create({
    data: {
      accordId,
      templateId: template.id,
      filledFields,
      contentHash,
    },
  });
}

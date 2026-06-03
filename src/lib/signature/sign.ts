import { addHours } from "date-fns";
import { prisma } from "@/lib/prisma";
import { SIGNATURE_EXPIRY_HOURS } from "@/lib/constants";
import { generateNotarialAct } from "@/lib/notarial/generate-act";
import { fundLoanFromEscrow } from "@/lib/wallet/escrow";
import { sendTransactionalEmail } from "@/lib/resend";

function assertIdentity(user: {
  username: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  name: string | null;
}) {
  if (!user.username || !user.dateOfBirth || !user.address || !user.name) {
    throw new Error("Profil incomplet : @id, date de naissance et adresse requis.");
  }
}

export async function expireCounterpartyIfNeeded(accordId: string) {
  const accord = await prisma.accord.findUnique({ where: { id: accordId } });
  if (
    accord?.statut === "AWAITING_COUNTERPARTY_SIGN" &&
    accord.signatureExpiresAt &&
    accord.signatureExpiresAt < new Date()
  ) {
    await prisma.accord.update({
      where: { id: accordId },
      data: { statut: "CANCELLED_TIMEOUT" },
    });
    await prisma.accordEvent.create({
      data: { accordId, type: "CANCELLED_TIMEOUT" },
    });
    return true;
  }
  return false;
}

export async function signAsInitiator(accordId: string, userId: string, signedName: string, ip?: string) {
  const accord = await prisma.accord.findFirst({
    where: { id: accordId, initiateurId: userId, statut: "AWAITING_INITIATOR_SIGN" },
    include: { initiateur: true, destinataire: true },
  });
  if (!accord) throw new Error("Accord introuvable ou déjà signé");
  if (!accord.destinataire) throw new Error("Contrepartie introuvable");

  assertIdentity(accord.initiateur);

  if (signedName.trim().length < 3) throw new Error("Signature invalide");

  const expiresAt = addHours(new Date(), SIGNATURE_EXPIRY_HOURS);

  await prisma.$transaction(async (tx) => {
    await tx.accordSignature.create({
      data: {
        accordId,
        userId,
        role: "INITIATOR",
        signedName: signedName.trim(),
        ipAddress: ip,
      },
    });
    await tx.accord.update({
      where: { id: accordId },
      data: {
        statut: "AWAITING_COUNTERPARTY_SIGN",
        signatureExpiresAt: expiresAt,
      },
    });
    await tx.accordEvent.create({
      data: { accordId, type: "INITIATOR_SIGNED" },
    });
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (accord.destinataire.email) {
    await sendTransactionalEmail({
      to: accord.destinataire.email,
      subject: `[Zéro-Palabre] Signature requise : ${accord.titre}`,
      html: `<p>Bonjour ${accord.destinataire.name ?? ""},</p>
        <p>${accord.initiateur.name} vous invite à signer l'accord « ${accord.titre} ».</p>
        <p>Vous avez ${SIGNATURE_EXPIRY_HOURS} h pour signer.</p>
        <p><a href="${baseUrl}/accords/${accordId}/signer">Signer l'accord</a></p>`,
    });
  }

  return { expiresAt };
}

export async function signAsCounterparty(accordId: string, userId: string, signedName: string, ip?: string) {
  if (await expireCounterpartyIfNeeded(accordId)) {
    throw new Error("Délai de signature expiré — accord annulé");
  }

  const accord = await prisma.accord.findFirst({
    where: {
      id: accordId,
      destinataireId: userId,
      statut: "AWAITING_COUNTERPARTY_SIGN",
    },
    include: { initiateur: true, destinataire: true },
  });
  if (!accord) throw new Error("Accord introuvable ou non disponible");
  if (!accord.destinataire) throw new Error("Contrepartie introuvable");

  assertIdentity(accord.destinataire);

  if (signedName.trim().length < 3) throw new Error("Signature invalide");

  await prisma.$transaction(async (tx) => {
    await tx.accordSignature.create({
      data: {
        accordId,
        userId,
        role: "COUNTERPARTY",
        signedName: signedName.trim(),
        ipAddress: ip,
      },
    });
    await tx.accord.update({
      where: { id: accordId },
      data: {
        statut: "DUAL_SIGNED",
        validatedAt: new Date(),
      },
    });
    await tx.accordEvent.create({
      data: { accordId, type: "COUNTERPARTY_SIGNED" },
    });
    await tx.accordEvent.create({
      data: { accordId, type: "DUAL_SIGNED" },
    });
  });

  await generateNotarialAct(accordId);

  if (accord.type === "PRET" && accord.montant) {
    await fundLoanFromEscrow(accordId);
  }

  return { success: true };
}

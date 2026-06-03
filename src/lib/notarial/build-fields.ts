import { createHash } from "crypto";
import type { Accord, User, AccordSignature } from "@prisma/client";
import { formatDate, formatMontant } from "@/lib/utils";
import { formatUsernameDisplay } from "@/lib/username";
import { montantEnLettres } from "@/lib/montant-lettres";
import { ACCORD_TYPE_LABELS } from "@/lib/constants";

export type NotarialFilledFields = {
  reference: string;
  typeLabel: string;
  titre: string;
  description: string;
  montantChiffres: string;
  montantLettres: string;
  dateEcheance: string;
  initiateur: {
    nom: string;
    familyName: string;
    username: string;
    phone: string;
    dateNaissance: string;
    adresse: string;
    signature: string;
    signedAt: string;
  };
  contrepartie: {
    nom: string;
    familyName: string;
    username: string;
    phone: string;
    dateNaissance: string;
    adresse: string;
    signature: string;
    signedAt: string;
  };
  templateVersion: string;
  generatedAt: string;
};

function userBlock(user: User, signature?: AccordSignature) {
  return {
    nom: user.name ?? "—",
    familyName: user.familyName ?? "—",
    username: user.username ? formatUsernameDisplay(user.username) : "—",
    phone: user.phone ?? "—",
    dateNaissance: user.dateOfBirth ? formatDate(user.dateOfBirth) : "—",
    adresse: user.address ?? "—",
    signature: signature?.signedName ?? "—",
    signedAt: signature ? formatDate(signature.signedAt) : "—",
  };
}

export function buildNotarialFields(input: {
  accord: Accord;
  initiateur: User;
  contrepartie: User;
  signatures: AccordSignature[];
  templateVersion: string;
}): NotarialFilledFields {
  const { accord, initiateur, contrepartie, signatures, templateVersion } = input;
  const montantNum = accord.montant ? Number(accord.montant) : 0;

  const initSign = signatures.find((s) => s.role === "INITIATOR");
  const cpSign = signatures.find((s) => s.role === "COUNTERPARTY");

  return {
    reference: accord.reference,
    typeLabel: ACCORD_TYPE_LABELS[accord.type] ?? accord.type,
    titre: accord.titre,
    description: accord.description,
    montantChiffres: montantNum > 0 ? formatMontant(montantNum, accord.devise) : "—",
    montantLettres: montantNum > 0 ? montantEnLettres(montantNum) : "—",
    dateEcheance: accord.dateEcheance ? formatDate(accord.dateEcheance) : "—",
    initiateur: userBlock(initiateur, initSign),
    contrepartie: userBlock(contrepartie, cpSign),
    templateVersion,
    generatedAt: new Date().toISOString(),
  };
}

export function hashNotarialFields(fields: NotarialFilledFields): string {
  return createHash("sha256").update(JSON.stringify(fields)).digest("hex");
}

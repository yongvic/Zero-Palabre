import { createHash } from "crypto";
import type { Accord } from "@/types/database";

export function buildAccordPayload(
  accord: Pick<
    Accord,
    | "reference"
    | "titre"
    | "description"
    | "type"
    | "montant"
    | "devise"
    | "dateEcheance"
    | "destinataireNom"
    | "destinataireEmail"
    | "validatedAt"
  >,
  partyProof?: unknown
) {
  return JSON.stringify({
    reference: accord.reference,
    titre: accord.titre,
    description: accord.description,
    type: accord.type,
    montant: accord.montant?.toString() ?? null,
    devise: accord.devise,
    dateEcheance: accord.dateEcheance?.toISOString() ?? null,
    destinataireNom: accord.destinataireNom,
    destinataireEmail: accord.destinataireEmail,
    validatedAt: accord.validatedAt?.toISOString() ?? null,
    partyProof: partyProof ?? null,
  });
}

export function hashAccordContent(
  accord: Parameters<typeof buildAccordPayload>[0],
  partyProof?: unknown
) {
  return createHash("sha256").update(buildAccordPayload(accord, partyProof)).digest("hex");
}

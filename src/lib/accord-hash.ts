import { createHash } from "crypto";
import type { Accord } from "@/types/database";

export function buildAccordPayload(accord: Pick<
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
>) {
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
  });
}

export function hashAccordContent(accord: Parameters<typeof buildAccordPayload>[0]) {
  return createHash("sha256").update(buildAccordPayload(accord)).digest("hex");
}

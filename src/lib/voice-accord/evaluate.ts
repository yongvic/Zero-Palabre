import { z } from "zod";
import { createAccordSchema, accordTypeSchema } from "@/lib/validations/accord";
import type { AccordDraftExtraction, VoiceMissingField } from "./types";
import type { CreateAccordInput } from "@/lib/validations/accord";

function parseEmail(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const email = value.trim().toLowerCase();
  return z.string().email().safeParse(email).success ? email : null;
}

export function buildDraftFromExtraction(
  extraction: AccordDraftExtraction,
  prior: Partial<CreateAccordInput> = {}
): Partial<CreateAccordInput> {
  const type =
    extraction.type !== "unclear" && accordTypeSchema.safeParse(extraction.type).success
      ? extraction.type
      : prior.type;

  return {
    type: type ?? prior.type ?? "AUTRE",
    titre: extraction.titre?.trim() || prior.titre,
    destinataireNom: extraction.destinataireNom?.trim() || prior.destinataireNom,
    destinataireEmail:
      parseEmail(extraction.destinataireEmail) ?? prior.destinataireEmail,
    montant:
      extraction.montant != null ? extraction.montant : prior.montant ?? null,
    devise: extraction.devise ?? prior.devise ?? "FCFA",
    dateEcheance: extraction.dateEcheance?.trim() || prior.dateEcheance || null,
    description: extraction.description?.trim() || prior.description,
  };
}

export function applyTextAnswersToDraft(
  draft: Partial<CreateAccordInput>,
  answers: Record<string, string>
): Partial<CreateAccordInput> {
  const next = { ...draft };
  for (const [key, value] of Object.entries(answers)) {
    const v = value.trim();
    if (!v) continue;
    switch (key) {
      case "type":
        if (accordTypeSchema.safeParse(v).success) {
          next.type = v as CreateAccordInput["type"];
        }
        break;
      case "montant":
        next.montant = Number(v.replace(/\s/g, "")) || null;
        break;
      case "devise":
        if (["FCFA", "EUR", "USD"].includes(v)) {
          next.devise = v as CreateAccordInput["devise"];
        }
        break;
      case "dateEcheance":
        next.dateEcheance = v;
        break;
      case "titre":
        next.titre = v;
        break;
      case "destinataireNom":
        next.destinataireNom = v;
        break;
      case "destinataireEmail":
        next.destinataireEmail = parseEmail(v) ?? v;
        break;
      case "description":
        next.description = v;
        break;
      default:
        break;
    }
  }
  return next;
}

export function evaluateAccordDraft(
  extraction: AccordDraftExtraction,
  merged: Partial<CreateAccordInput>
): { missingFields: VoiceMissingField[]; ready: boolean; draft: Partial<CreateAccordInput> } {
  const draft = buildDraftFromExtraction(extraction, merged);
  const missing: VoiceMissingField[] = [];

  if (!draft.type || extraction.type === "unclear") {
    missing.push({
      key: "type",
      label: "Type d'accord",
      question:
        "Précisez le type : prêt, prestation, location, commande ou autre.",
    });
  }

  if (!draft.titre || draft.titre.length < 5) {
    missing.push({
      key: "titre",
      label: "Titre",
      question: "Donnez un titre court à cet accord (au moins 5 caractères).",
    });
  }

  if (!draft.destinataireNom || draft.destinataireNom.length < 2) {
    missing.push({
      key: "destinataireNom",
      label: "Nom du destinataire",
      question: "Indiquez le nom complet de la personne avec qui vous concluez l'accord.",
    });
  }

  if (!parseEmail(draft.destinataireEmail)) {
    missing.push({
      key: "destinataireEmail",
      label: "Email du destinataire",
      question: "Indiquez l'adresse email du destinataire pour l'invitation.",
    });
  }

  if (!draft.description || draft.description.length < 20) {
    missing.push({
      key: "description",
      label: "Description",
      question:
        "Décrivez les termes de l'accord (montant, délais, obligations) en au moins 20 caractères.",
    });
  }

  const aiMissing = extraction.missingFields.filter(
    (f) => !missing.some((m) => m.key === f.key)
  );
  const allMissing = [...missing, ...aiMissing].filter(
    (item, index, arr) => arr.findIndex((x) => x.key === item.key) === index
  );

  let ready = false;
  try {
    createAccordSchema.parse({
      ...draft,
      montant: draft.montant ?? null,
      dateEcheance: draft.dateEcheance ?? null,
    });
    ready = allMissing.length === 0;
  } catch {
    ready = false;
  }

  return { missingFields: ready ? [] : allMissing, ready, draft };
}

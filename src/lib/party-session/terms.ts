import { ACCORD_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatMontant } from "@/lib/utils";
import type { PartyAccordSnapshot, PartyTermField } from "./types";

type AccordRow = {
  titre: string;
  type: string;
  description: string;
  montant: unknown;
  devise: string;
  dateEcheance: Date | null;
  destinataireNom: string;
  destinataireEmail: string;
  reference: string;
  publicToken: string;
  initiateur: { name: string | null; email: string };
};

export function accordToSnapshot(accord: AccordRow): PartyAccordSnapshot {
  const montant =
    accord.montant != null
      ? formatMontant(Number(accord.montant), accord.devise)
      : null;

  return {
    publicToken: accord.publicToken,
    reference: accord.reference,
    titre: accord.titre,
    type: accord.type,
    typeLabel: ACCORD_TYPE_LABELS[accord.type] ?? accord.type,
    description: accord.description,
    montant,
    devise: accord.devise,
    dateEcheance: accord.dateEcheance ? formatDate(accord.dateEcheance) : null,
    destinataireNom: accord.destinataireNom,
    destinataireEmail: accord.destinataireEmail,
    initiateurName: accord.initiateur.name ?? "Initiateur",
    initiateurEmail: accord.initiateur.email,
  };
}

export function buildTermFields(snapshot: PartyAccordSnapshot): PartyTermField[] {
  const fields: PartyTermField[] = [
    {
      key: "titre",
      label: "Titre de l'accord",
      description: "Intitulé qui résume l'engagement",
      originalValue: snapshot.titre,
    },
    {
      key: "type",
      label: "Type d'accord",
      description: "Nature juridique de la formalisation",
      originalValue: snapshot.typeLabel,
      inputType: "select",
      selectOptions: Object.entries(ACCORD_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
  ];

  if (snapshot.montant) {
    fields.push({
      key: "montant",
      label: "Montant",
      description: "Somme convenue entre les parties",
      originalValue: snapshot.montant,
      inputType: "text",
    });
  }

  if (snapshot.dateEcheance) {
    fields.push({
      key: "dateEcheance",
      label: "Date d'échéance",
      description: "Date limite prévue",
      originalValue: snapshot.dateEcheance,
      inputType: "text",
    });
  }

  fields.push({
    key: "description",
    label: "Termes détaillés",
    description: "Description complète des obligations",
    originalValue: snapshot.description,
    multiline: true,
  });

  return fields;
}

export function hasAmendments(responses: Record<string, { action: string }>): boolean {
  return Object.values(responses).some((r) => r.action === "amended");
}

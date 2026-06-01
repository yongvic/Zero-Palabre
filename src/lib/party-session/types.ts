import { z } from "zod";

export const fieldActionSchema = z.enum(["accepted", "amended"]);

export const fieldResponseSchema = z.object({
  action: fieldActionSchema,
  originalValue: z.string(),
  proposedValue: z.string().optional(),
  at: z.string(),
});

export type FieldResponse = z.infer<typeof fieldResponseSchema>;
export type FieldResponses = Record<string, FieldResponse>;

export type PartyAccordSnapshot = {
  publicToken: string;
  reference: string;
  titre: string;
  type: string;
  typeLabel: string;
  description: string;
  montant: string | null;
  devise: string;
  dateEcheance: string | null;
  destinataireNom: string;
  destinataireEmail: string;
  initiateurName: string;
  initiateurEmail: string;
};

export type PartyTermField = {
  key: string;
  label: string;
  description: string;
  originalValue: string;
  multiline?: boolean;
  inputType?: "text" | "number" | "date" | "select";
  selectOptions?: { value: string; label: string }[];
};

export type PartySessionClient = {
  sessionId: string;
  status: string;
  currentStep: number;
  confirmedName: string | null;
  confirmedEmail: string | null;
  fieldResponses: FieldResponses;
  signatureName: string | null;
  hasAmendments: boolean;
  cguAccepted: boolean;
};

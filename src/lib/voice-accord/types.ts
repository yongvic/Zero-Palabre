import { z } from "zod";
import { accordTypeSchema } from "@/lib/validations/accord";

export const accordDraftExtractionSchema = z.object({
  type: z.union([accordTypeSchema, z.literal("unclear")]),
  titre: z.string().nullable(),
  destinataireNom: z.string().nullable(),
  destinataireEmail: z.string().nullable(),
  montant: z.number().nullable().optional(),
  devise: z.enum(["FCFA", "EUR", "USD"]).nullable().optional(),
  dateEcheance: z.string().nullable().optional(),
  description: z.string().nullable(),
  missingFields: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      question: z.string(),
    })
  ),
  confidence: z.number().min(0).max(1),
  summaryFr: z.string(),
});

export type AccordDraftExtraction = z.infer<typeof accordDraftExtractionSchema>;
export type VoiceMissingField = AccordDraftExtraction["missingFields"][number];

export type VoiceAccordDraftPayload = {
  sessionId: string;
  draft: Record<string, unknown>;
  missingFields: VoiceMissingField[];
  ready: boolean;
  summaryFr: string | null;
  transcripts: string[];
};

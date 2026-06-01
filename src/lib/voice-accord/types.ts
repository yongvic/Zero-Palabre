import { z } from "zod";
import { accordTypeSchema } from "@/lib/validations/accord";

const nullableString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (v == null || v === "" ? null : String(v)));

export const accordDraftExtractionSchema = z.object({
  type: z.union([accordTypeSchema, z.literal("unclear")]),
  titre: nullableString,
  destinataireNom: nullableString,
  destinataireEmail: nullableString,
  montant: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .transform((v) => {
      if (v == null || v === "") return null;
      const n = typeof v === "number" ? v : Number(String(v).replace(/\s/g, ""));
      return Number.isFinite(n) ? n : null;
    }),
  devise: z.enum(["FCFA", "EUR", "USD"]).nullable().optional(),
  dateEcheance: nullableString.optional(),
  description: nullableString,
  missingFields: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        question: z.string(),
      })
    )
    .default([]),
  confidence: z
    .union([z.number(), z.string()])
    .transform((v) => {
      const n = typeof v === "number" ? v : parseFloat(String(v));
      if (!Number.isFinite(n)) return 0.5;
      return Math.min(1, Math.max(0, n));
    }),
  summaryFr: z.string().default(""),
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

import { z } from "zod";

export const voiceIntentSchema = z.enum(["accept", "reject"]);

export const voiceExtractionSchema = z.object({
  intent: z.enum(["accept", "reject", "unclear"]),
  signerName: z.string().nullable(),
  explicitConsent: z.boolean(),
  acknowledgedTerms: z.boolean(),
  commentaire: z.string().nullable(),
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

export type VoiceExtraction = z.infer<typeof voiceExtractionSchema>;

export type VoiceMissingField = VoiceExtraction["missingFields"][number];

export type VoiceAccordContext = {
  reference: string;
  titre: string;
  destinataireNom: string;
  initiateurName: string;
  montant: string | null;
  devise: string;
  description: string;
};

export type VoiceSessionPayload = {
  sessionId: string;
  intent: "accept" | "reject" | null;
  transcripts: string[];
  extracted: VoiceExtraction | null;
  missingFields: VoiceMissingField[];
  ready: boolean;
  summaryFr: string | null;
};

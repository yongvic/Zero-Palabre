import { z } from "zod";

export const accordTypeSchema = z.enum([
  "PRET",
  "PRESTATION",
  "LOCATION",
  "COMMANDE",
  "AUTRE",
]);

export const createAccordSchema = z.object({
  type: accordTypeSchema,
  titre: z
    .string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(100),
  destinataireNom: z
    .string()
    .min(2, "Nom du destinataire requis")
    .max(80),
  destinataireEmail: z.string().email("Email invalide"),
  montant: z.coerce.number().positive().max(99999999).optional().nullable(),
  devise: z.enum(["FCFA", "EUR", "USD"]).default("FCFA"),
  dateEcheance: z.string().optional().nullable(),
  description: z
    .string()
    .min(20, "Décrivez l'accord en au moins 20 caractères")
    .max(2000),
});

export const validateAccordSchema = z.object({
  action: z.enum(["accept", "reject"]),
  commentaire: z.string().max(500).optional(),
  voiceSessionId: z.string().min(1).optional(),
});

export type CreateAccordInput = z.infer<typeof createAccordSchema>;

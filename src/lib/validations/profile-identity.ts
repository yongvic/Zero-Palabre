import { z } from "zod";
import { normalizeUsername } from "@/lib/username";

export const profileIdentitySchema = z.object({
  username: z
    .string()
    .min(3)
    .max(31)
    .transform(normalizeUsername)
    .refine((v) => /^[a-z0-9_]{3,30}$/.test(v), {
      message: "Identifiant : 3–30 caractères (a-z, 0-9, _)",
    }),
  familyName: z.string().min(2).max(80).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  address: z.string().min(5, "Adresse requise").max(500),
  phone: z.string().min(8).max(20).optional(),
});

export type ProfileIdentityInput = z.infer<typeof profileIdentitySchema>;

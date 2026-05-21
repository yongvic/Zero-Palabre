import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z
    .string()
    .min(2, "Nom requis")
    .max(80),
  phone: z.string().max(20).optional(),
  acceptCgu: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les CGU" }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
});

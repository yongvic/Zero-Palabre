import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nom requis (min 2 caractères)").max(80),
    email: z.string().email("Email invalide"),
    phone: z.string().max(20).optional(),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    acceptCgu: z.literal(true, {
      errorMap: () => ({ message: "Vous devez accepter les CGU" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

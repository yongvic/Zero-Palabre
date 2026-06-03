import { z } from "zod";

export const walletDepositSchema = z.object({
  rail: z.enum(["TMONEY", "FLOOZ"]),
  phone: z
    .string()
    .min(8, "Numéro invalide")
    .max(15)
    .regex(/^\+?[0-9\s-]+$/, "Format de numéro invalide"),
  amount: z.number().min(100, "Minimum 100 FCFA").max(10_000_000),
});

export const walletWithdrawSchema = walletDepositSchema.extend({
  amount: z.number().min(500, "Minimum 500 FCFA").max(10_000_000),
});

export type WalletDepositInput = z.infer<typeof walletDepositSchema>;
export type WalletWithdrawInput = z.infer<typeof walletWithdrawSchema>;

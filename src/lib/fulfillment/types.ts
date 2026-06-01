import { z } from "zod";

export const paymentMethodSchema = z.enum([
  "TMONEY",
  "FLOOZ",
  "CASH",
  "BANK_TRANSFER",
  "OTHER",
]);

export const declareFulfillmentSchema = z.object({
  amountDeclared: z.number().positive(),
  paidAt: z.string().min(1),
  paymentMethod: paymentMethodSchema,
  reference: z.string().max(120).optional(),
  proofData: z.string().max(500_000).optional(),
  declaredName: z.string().min(2).max(80),
  declaredEmail: z.string().email(),
});

export const rejectFulfillmentSchema = z.object({
  reason: z.string().min(5).max(500),
});

export const disputeSchema = z.object({
  reason: z.string().min(5).max(500),
});

export type DeclareFulfillmentInput = z.infer<typeof declareFulfillmentSchema>;

import { createHash } from "crypto";

export function buildFulfillmentPayload(data: {
  accordReference: string;
  contentHash: string | null;
  amountDeclared: string;
  paidAt: string;
  paymentMethod: string;
  reference: string | null;
  declaredName: string;
  declaredEmail: string;
  declaredAt: string;
  confirmedAt: string;
  confirmedByEmail: string;
  hasProof: boolean;
}) {
  return JSON.stringify(data);
}

export function hashFulfillment(payload: ReturnType<typeof buildFulfillmentPayload>) {
  return createHash("sha256").update(payload).digest("hex");
}

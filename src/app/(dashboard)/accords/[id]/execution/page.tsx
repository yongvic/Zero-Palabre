import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ConfirmFulfillmentClient } from "@/components/accord/fulfillment/confirm-fulfillment-client";

export default async function AccordExecutionPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const accord = await prisma.accord.findFirst({
    where: { id: params.id, initiateurId: session!.user!.id },
    include: { fulfillment: true },
  });

  if (!accord) notFound();
  if (!accord.fulfillment || accord.fulfillment.status !== "DECLARED") {
    redirect(`/accords/${params.id}`);
  }

  const f = accord.fulfillment;
  if (!f.amountDeclared || !f.paidAt || !f.paymentMethod || !f.declaredName) {
    redirect(`/accords/${params.id}`);
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-0 p-6 md:p-8 shadow-xs">
        <ConfirmFulfillmentClient
          accordId={accord.id}
          titre={accord.titre}
          reference={accord.reference}
          montant={Number(accord.montant)}
          devise={accord.devise}
          declaredName={f.declaredName}
          amountDeclared={Number(f.amountDeclared)}
          paidAt={f.paidAt.toISOString()}
          paymentMethod={f.paymentMethod}
          referenceTx={f.reference}
          hasProof={Boolean(f.proofData)}
        />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

import { ExecuterWizard } from "@/components/accord/fulfillment/executer-wizard";
import { PublicPageShell } from "@/components/layout/public-page-shell";

export default function ExecuterPage({
  params,
}: {
  params: { fulfillToken: string };
}) {
  return (
    <PublicPageShell badge="Déclaration de remboursement">
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <ExecuterWizard fulfillToken={params.fulfillToken} />
      </div>
    </PublicPageShell>
  );
}

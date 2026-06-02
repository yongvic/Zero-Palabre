export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AccordList } from "@/components/accord/accord-list";
import { EmptyAccords } from "@/components/accord/empty-accords";

export default async function AccordsPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const accordsRaw = await prisma.accord.findMany({
    where: {
      OR: [
        { initiateurId: userId },
        { destinataireId: userId },
      ],
    },
    include: {
      initiateur: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const accords = accordsRaw.map((a) => ({
    ...a,
    montant: a.montant != null ? Number(a.montant) : null,
  }));

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tighter text-neutral-950 sm:text-4xl">
            Mes accords
          </h1>
          <p className="text-base text-neutral-600">
            Gérez vos engagements et suivez vos preuves numériques.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end px-4 text-right sm:flex">
            <span className="text-2xl font-bold tracking-tight tabular-nums text-primary-700">
              {accords.length}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Total actifs
            </span>
          </div>
          <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary-700/10">
            <Link href="/accords/nouveau">
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              Nouvel accord
            </Link>
          </Button>
        </div>
      </div>

      {accords.length === 0 ? (
        <EmptyAccords />
      ) : (
        <AccordList accords={accords} userId={userId} />
      )}
    </div>
  );
}



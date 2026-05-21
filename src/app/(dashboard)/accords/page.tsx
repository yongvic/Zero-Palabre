export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AccordCard } from "@/components/accord/accord-card";
import { EmptyAccords } from "@/components/accord/empty-accords";

export default async function AccordsPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const accords = await prisma.accord.findMany({
    where: { initiateurId: userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-xl text-neutral-900">Mes accords</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {accords.length} accord{accords.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/accords/nouveau">
            <Plus className="h-5 w-5" strokeWidth={1.5} />
            Nouvel accord
          </Link>
        </Button>
      </div>

      {accords.length === 0 ? (
        <EmptyAccords />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accords.map((accord) => (
            <AccordCard key={accord.id} accord={accord} />
          ))}
        </div>
      )}
    </div>
  );
}

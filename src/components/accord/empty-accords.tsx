import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyAccords() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
        <FileText className="h-10 w-10 text-primary-700" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-neutral-700">Aucun accord pour l&apos;instant</h3>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        Créez votre premier accord numérique en moins de 2 minutes et envoyez-le à votre partenaire.
      </p>
      <Button asChild className="mt-8">
        <Link href="/accords/nouveau">Créer un accord</Link>
      </Button>
    </div>
  );
}

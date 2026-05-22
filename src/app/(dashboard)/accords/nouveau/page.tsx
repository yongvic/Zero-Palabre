import { auth } from "@/auth";
import { CreateAccordForm } from "@/components/accord/create-accord-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NouvelAccordPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="space-y-6">
        <Link 
          href="/accords" 
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-primary-700 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour aux accords
        </Link>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black tracking-tighter text-neutral-950 sm:text-4xl">
            Initier un accord.
          </h1>
          <p className="text-base text-neutral-500 font-medium">
            Suivez les étapes pour créer une preuve numérique certifiée.
          </p>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-neutral-200 bg-neutral-0 p-6 md:p-10 shadow-premium">
        <CreateAccordForm
          initiateurName={session!.user!.name ?? "Utilisateur"}
          initiateurEmail={session!.user!.email ?? ""}
        />
      </div>
    </div>
  );
}


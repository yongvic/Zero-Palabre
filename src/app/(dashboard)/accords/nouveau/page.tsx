import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreateAccordTabs } from "@/components/accord/create-accord-tabs";
import { QuotaBanner } from "@/components/accord/quota-banner";
import { OnlineGuard } from "@/components/pwa/online-guard";
import { getAccordQuota } from "@/lib/accord-quota";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NouvelAccordPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const quota = await getAccordQuota(session.user.id);

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
            Décrivez votre accord à la voix ou remplissez le formulaire — l&apos;IA structure
            votre déclaration avant envoi.
          </p>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-neutral-200 bg-neutral-0 p-6 md:p-10 shadow-premium">
        <QuotaBanner quota={quota} />
        {quota.canCreate ? (
          <OnlineGuard action="La création d'un accord">
            <CreateAccordTabs
              initiateurName={session.user.name ?? "Utilisateur"}
              initiateurEmail={session.user.email ?? ""}
              voiceEnabled={
                Boolean(process.env.GEMINI_API_KEY) ||
                Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
              }
            />
          </OnlineGuard>
        ) : null}
      </div>
    </div>
  );
}


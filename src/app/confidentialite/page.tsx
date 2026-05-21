import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function ConfidentialitePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 md:px-10">
        <h1 className="text-heading-xl">Politique de confidentialité</h1>
        <p className="mt-6 text-neutral-600 leading-relaxed">
          Nous collectons uniquement les données nécessaires au service (email, nom, téléphone optionnel).
          Conformité Loi togolaise n°2019-014 et principes RGPD. Droit à l&apos;oubli — phase 2.
        </p>
        <Link href="/" className="mt-8 inline-block text-primary-800 font-medium">
          Retour à l&apos;accueil
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}

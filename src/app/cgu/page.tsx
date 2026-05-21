import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function CguPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 md:px-10">
        <h1 className="text-heading-xl">Conditions générales d&apos;utilisation</h1>
        <p className="mt-6 text-neutral-600 leading-relaxed">
          Zéro-Palabre est une plateforme d&apos;aide à la formalisation d&apos;accords.
          Les accords créés ne constituent pas un contrat notarié. Version MVP — Mai 2026.
        </p>
        <Link href="/" className="mt-8 inline-block text-primary-800 font-medium">
          Retour à l&apos;accueil
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}

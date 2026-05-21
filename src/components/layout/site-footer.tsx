import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-150 bg-neutral-0">
      <div className="mx-auto max-w-container px-4 py-16 md:px-10 lg:px-20">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Image
              src="/brand/logo-vert.png"
              alt="Zéro-Palabre"
              width={120}
              height={32}
              className="mb-4 h-8 w-auto"
            />
            <p className="max-w-xs text-sm leading-relaxed text-neutral-600">
              La preuve simple des accords du quotidien. Formalisez vos engagements en moins de 2 minutes.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-900">Produit</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="#fonctionnalites" className="hover:text-primary-800">Fonctionnalités</Link></li>
              <li><Link href="#tarifs" className="hover:text-primary-800">Tarifs</Link></li>
              <li><Link href="/verifier" className="hover:text-primary-800">Vérifier un accord</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-900">Légal</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="/cgu" className="hover:text-primary-800">CGU</Link></li>
              <li><Link href="/confidentialite" className="hover:text-primary-800">Confidentialité</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-900">Contact</h4>
            <p className="text-sm text-neutral-600">contact@zeropalabre.com</p>
            <p className="mt-2 text-sm text-neutral-600">Lomé, Togo</p>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-neutral-150 pt-8 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Zéro-Palabre. Tous droits réservés.</p>
          <p className="max-w-lg">
            Zéro-Palabre n&apos;est pas un service juridique. Les accords créés constituent une preuve de bonne foi à valeur probatoire partielle.
          </p>
        </div>
      </div>
    </footer>
  );
}

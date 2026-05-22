import Image from "next/image";
import Link from "next/link";
import { Handshake, Twitter, Linkedin, Github } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-0">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image
                src="/brand/logo-vert.png"
                alt="Zéro-Palabre"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <p className="max-w-sm text-base leading-relaxed text-neutral-500 font-medium">
              Zéro-Palabre transforme la confiance verbale en preuves numériques inaltérables. La solution simple pour sécuriser vos échanges au Togo et partout ailleurs.
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary-700 hover:border-primary-200 transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary-700 hover:border-primary-200 transition-all">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary-700 hover:border-primary-200 transition-all">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-8 grid gap-10 grid-cols-2 md:grid-cols-3">
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Produit</h4>
              <ul className="space-y-4 text-sm font-bold text-neutral-500">
                <li><Link href="#fonctionnalites" className="hover:text-primary-700 transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#tarifs" className="hover:text-primary-700 transition-colors">Tarifs & Offres</Link></li>
                <li><Link href="/verifier" className="hover:text-primary-700 transition-colors">Vérifier un PDF</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Légal</h4>
              <ul className="space-y-4 text-sm font-bold text-neutral-500">
                <li><Link href="/cgu" className="hover:text-primary-700 transition-colors">Conditions Générales</Link></li>
                <li><Link href="/confidentialite" className="hover:text-primary-700 transition-colors">Confidentialité</Link></li>
                <li><Link href="/mentions-legales" className="hover:text-primary-700 transition-colors">Mentions Légales</Link></li>
              </ul>
            </div>
            <div className="space-y-6 col-span-2 md:col-span-1">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">Contact</h4>
              <ul className="space-y-4 text-sm font-bold text-neutral-500">
                <li className="flex flex-col gap-1">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-widest">Support</span>
                  <span className="text-neutral-900">contact@zeropalabre.com</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-widest">Siège</span>
                  <span className="text-neutral-900">Lomé, Togo</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-neutral-100 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-700 flex items-center justify-center text-neutral-0">
               <Handshake className="h-4.5 w-4.5" />
            </div>
            <p className="text-[13px] font-bold text-neutral-900">© {new Date().getFullYear()} Zéro-Palabre.</p>
          </div>
          <p className="max-w-2xl text-[11px] leading-relaxed text-neutral-400 font-medium">
            Zéro-Palabre n&apos;est pas une étude notariale ni un cabinet juridique. Les accords certifiés constituent des éléments de preuve de bonne foi à valeur probatoire facilitant le règlement des litiges civils.
          </p>
        </div>
      </div>
    </footer>
  );
}


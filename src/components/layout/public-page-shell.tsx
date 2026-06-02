import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { AmbientBackground } from "./ambient-background";

type Props = {
  children: React.ReactNode;
  badge?: string;
  showBack?: boolean;
};

/** Enveloppe premium pour valider / verifier / executer */
export function PublicPageShell({
  children,
  badge = "Preuve sécurisée",
  showBack = false,
}: Props) {
  return (
    <div className="relative min-h-[100dvh] pb-24">
      <AmbientBackground />
      <header className="glass-nav sticky top-0 z-40 px-4 py-3.5 md:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <Link
                href="/"
                className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Retour à l'accueil"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </Link>
            )}
            <Image
              src="/brand/logo-vert.png"
              alt="Zéro-Palabre"
              width={110}
              height={28}
              priority
              className="h-[22px] w-auto"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-800">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
            {badge}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-4 pt-8 md:px-6 md:pt-10">{children}</main>
    </div>
  );
}

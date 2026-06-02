"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const avatars = [
  { initials: "KM", name: "Koffi Mensah", color: "bg-primary-600" },
  { initials: "AT", name: "Aminata Touré", color: "bg-amber-500" },
  { initials: "YO", name: "Yaw Owusu", color: "bg-primary-700" },
  { initials: "FB", name: "Farida Bello", color: "bg-neutral-700" },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-[88dvh] items-center pt-24">
      <div className="absolute inset-0 african-pattern-mask opacity-[0.04] pointer-events-none" />
      <div className="absolute top-1/4 right-0 h-[420px] w-[420px] glow-primary pointer-events-none" />

      <div className="page-container relative w-full py-16 md:py-20">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-8 lg:col-span-7"
          >
            <span className="section-eyebrow inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-1.5">
              <Smartphone className="h-3.5 w-3.5" />
              Preuve numérique · Togo &amp; Afrique de l&apos;Ouest
            </span>
            <h1 className="text-display-xl text-balance text-neutral-950">
              Zéro palabre.
              <br />
              Formalisez vos engagements.
            </h1>
            <p className="max-w-lg text-lg font-medium leading-relaxed text-neutral-600 md:text-xl">
              Prêts, locations, prestations — transformez vos accords verbaux en preuves certifiées en moins de 2 minutes.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button size="lg" className="h-12 rounded-2xl px-8" asChild>
                <Link href="/inscription">
                  Démarrer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" className="h-12 rounded-2xl px-8" asChild>
                <Link href="#comment-ca-marche">Voir la méthode</Link>
              </Button>
            </div>

            <div className="flex items-center gap-5 pt-2">
              <div className="flex -space-x-2.5" aria-hidden>
                {avatars.map((av, i) => (
                  <div
                    key={i}
                    title={av.name}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-0 text-xs font-bold text-white shadow-sm ${av.color}`}
                  >
                    {av.initials}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-neutral-500">
                Plus de 1&nbsp;200 accords certifiés ce mois-ci
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="hidden lg:col-span-5 lg:block"
          >
            <div className="glass-card relative overflow-hidden rounded-3xl p-8 shadow-premium">
              <div className="absolute right-6 top-6">
                <div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-2xl border border-primary-100 bg-primary-50">
                  <span className="font-mono text-2xl font-black text-primary-800">2</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600">min</span>
                </div>
              </div>

              <div className="relative space-y-6">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary-700">
                    Document sécurisé
                  </p>
                  <h2 className="text-2xl font-extrabold tracking-tight text-neutral-950">
                    Accord de prestation photo
                  </h2>
                </div>

                <div className="space-y-3 border-t border-neutral-100 pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Montant</span>
                    <span className="font-mono font-bold tabular-nums text-primary-800">125&nbsp;000 FCFA</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Échéance</span>
                    <span className="font-mono font-semibold text-neutral-800">24 juin 2026</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-primary-100 bg-primary-50/80 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                    <CheckCircle2 className="h-5 w-5 text-primary-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary-700">Statut certifié</p>
                    <p className="font-mono text-sm font-medium text-neutral-800">ZP-2026-X8802</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

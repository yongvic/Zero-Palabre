"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-primary-800 py-24 text-white md:py-28">
      <div className="absolute inset-0 african-pattern-mask opacity-[0.06] pointer-events-none" />
      <div className="page-container relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="mx-auto max-w-2xl space-y-8"
        >
          <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-5xl">
            Dites adieu aux malentendus
          </h2>
          <p className="text-lg font-medium leading-relaxed text-primary-100/90">
            Rejoignez ceux qui préfèrent une preuve claire à une longue palabre. Sécurisez vos relations dès aujourd&apos;hui.
          </p>
          <div className="space-y-4">
            <Button
              size="lg"
              variant="secondary"
              className="h-14 rounded-2xl border-0 bg-white px-10 text-lg text-primary-900 shadow-lg hover:bg-primary-50"
              asChild
            >
              <Link href="/inscription">Créer mon premier accord gratuitement</Link>
            </Button>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-200">
              Sans carte bancaire · 3 accords offerts
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

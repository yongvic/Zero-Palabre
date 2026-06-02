"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLAN_PRICES_FCFA } from "@/lib/constants";

const plans = [
  { name: "Gratuit", price: "0 FCFA", detail: "3 accords / mois", highlight: false },
  { name: "Starter", price: `${PLAN_PRICES_FCFA.STARTER.toLocaleString("fr-FR")} FCFA`, detail: "20 accords / mois", highlight: false },
  { name: "Pro", price: `${PLAN_PRICES_FCFA.PRO.toLocaleString("fr-FR")} FCFA`, detail: "100 accords / mois", highlight: true },
];

const faqs = [
  {
    q: "Est-ce un contrat notarié ?",
    a: "Non. Zéro-Palabre produit une preuve numérique horodatée qui facilite le règlement des litiges, sans remplacer un acte notarié.",
  },
  {
    q: "Le destinataire doit-il créer un compte ?",
    a: "Non pour valider un accord : un lien sécurisé suffit (validité 5 h après envoi).",
  },
  {
    q: "Puis-je vérifier un PDF plus tard ?",
    a: "Oui, via la page de vérification publique et le QR code sur chaque attestation.",
  },
];

export function PricingFaq() {
  return (
    <>
      <section id="tarifs" className="py-24 md:py-28">
        <div className="page-container">
          <div className="mb-12 max-w-xl space-y-3">
            <p className="section-eyebrow">Tarifs</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 md:text-4xl">
              Commencez gratuitement
            </h2>
            <p className="text-lg font-medium text-neutral-600">
              Évoluez quand votre volume d&apos;accords augmente.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.highlight ? "ring-2 ring-primary-600/30" : ""}
              >
                {plan.highlight && (
                  <span className="mb-3 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800">
                    Recommandé
                  </span>
                )}
                <h3 className="text-lg font-bold text-neutral-950">{plan.name}</h3>
                <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-primary-800">{plan.price}</p>
                <p className="mt-1 text-sm text-neutral-600">{plan.detail}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild variant="secondary">
              <Link href="/abonnement">Voir les offres complètes</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-neutral-200/80 bg-neutral-0/50 py-24 md:py-28">
        <div className="page-container max-w-3xl">
          <p className="section-eyebrow mb-3">FAQ</p>
          <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-neutral-950">Questions fréquentes</h2>
          <dl className="space-y-6">
            {faqs.map((item, i) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-6"
              >
                <dt className="text-base font-bold text-neutral-950">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-neutral-600">{item.a}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

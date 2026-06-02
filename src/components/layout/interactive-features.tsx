"use client";

import Link from "next/link";
import { Zap, FileCheck, Handshake, Shield, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Zap,
    title: "Vitesse d'exécution",
    description:
      "Formalisez vos accords en moins de 2 minutes depuis votre mobile.",
  },
  {
    icon: FileCheck,
    title: "Preuve inaltérable",
    description:
      "PDF horodaté avec QR de vérification et empreinte SHA-256.",
  },
  {
    icon: Handshake,
    title: "Accord bilatéral",
    description:
      "Le destinataire valide sans compte obligatoire pour la première preuve.",
  },
  {
    icon: Shield,
    title: "Réputation digitale",
    description:
      "Score de fiabilité basé sur vos engagements honorés.",
  },
];

const steps = [
  { n: "01", title: "Paramétrez l'accord", desc: "Type, parties, montant et échéances." },
  { n: "02", title: "Invitez le partenaire", desc: "Email ou lien sécurisé (validité 5 h)." },
  { n: "03", title: "Validation mutuelle", desc: "Acceptation documentée et horodatée." },
  { n: "04", title: "Preuve délivrée", desc: "PDF certifié, vérifiable à vie." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
};

export function InteractiveFeatures() {
  return (
    <>
      <section id="fonctionnalites" className="relative py-24 md:py-32">
        <div className="page-container">
          <div className="mb-14 max-w-2xl space-y-4">
            <p className="section-eyebrow">Fonctionnalités</p>
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-neutral-950 md:text-4xl">
              Pourquoi choisir <span className="text-primary-700">Zéro-Palabre</span> ?
            </h2>
            <p className="text-lg font-medium text-neutral-600">
              La confiance ne suffit pas toujours — nous créons la preuve qui protège vos relations.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="bento-grid"
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={itemVariants}
                  className={i === 0 ? "bento-span-7" : i === 3 ? "bento-span-5" : "bento-span-4"}
                >
                  <Card interactive className="flex h-full flex-col justify-between p-8">
                    <div className="space-y-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                        <Icon className="h-6 w-6" strokeWidth={2} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold tracking-tight text-neutral-950">{f.title}</h3>
                        <p className="text-sm leading-relaxed text-neutral-600">{f.description}</p>
                      </div>
                    </div>
                    <span className="mt-6 inline-flex items-center text-xs font-semibold text-primary-700 opacity-0 transition-opacity group-hover:opacity-100">
                      En savoir plus
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section id="comment-ca-marche" className="relative overflow-hidden border-y border-neutral-200/80 bg-neutral-0/60 py-24 md:py-32">
        <div className="page-container">
          <div className="flex flex-col items-start gap-14 lg:flex-row">
            <div className="max-w-md space-y-5 lg:sticky lg:top-28">
              <p className="section-eyebrow">Méthode</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 md:text-4xl">
                Un processus <span className="text-primary-700">fluide</span>
              </h2>
              <p className="text-lg font-medium text-neutral-600">
                Quatre étapes pour sécuriser un échange du quotidien.
              </p>
              <Button asChild variant="secondary" className="rounded-xl">
                <Link href="/inscription">Créer un accord</Link>
              </Button>
            </div>

            <ol className="flex-1 space-y-4">
              {steps.map((step, idx) => (
                <motion.li
                  key={step.n}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="glass-card flex gap-5 rounded-2xl p-6 hover-lift"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 font-mono text-sm font-bold text-neutral-400">
                    {step.n}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-neutral-950">{step.title}</h3>
                    <p className="text-sm font-medium leading-relaxed text-neutral-600">{step.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}

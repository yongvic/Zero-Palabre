"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Handshake,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const features = [
  {
    icon: Zap,
    title: "Vitesse d'exécution",
    description:
      "Formalisez vos accords en moins de 2 minutes depuis votre mobile. L'efficacité au service de la confiance.",
  },
  {
    icon: FileCheck,
    title: "Preuve Inaltérable",
    description:
      "PDF horodaté avec QR de vérification unique et empreinte numérique (Hash SHA-256).",
  },
  {
    icon: Handshake,
    title: "Accord Bilatéral",
    description:
      "Le destinataire valide l'engagement en un clic. Pas de compte requis pour la preuve initiale.",
  },
  {
    icon: Shield,
    title: "Réputation Digitale",
    description:
      "Construisez un score de fiabilité basé sur vos engagements honorés au fil du temps.",
  },
];

const steps = [
  { n: "01", title: "Paramétrez l'accord", desc: "Type, parties, montant et échéances clés." },
  { n: "02", title: "Invitez le partenaire", desc: "Envoi instantané via email ou lien sécurisé." },
  { n: "03", title: "Validation mutuelle", desc: "Acceptation documentée et horodatée par le système." },
  { n: "04", title: "Délivrance de preuve", desc: "PDF certifié, téléchargeable et vérifiable à vie." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 25 } },
};

export default function HomePage() {
  return (
    <>
      <SiteHeader dark />
      <main className="overflow-hidden">
        {/* Hero Section — Asymmetric & Premium */}
        <section className="relative min-h-[90dvh] flex items-center bg-neutral-950 text-neutral-0">
          <div className="absolute inset-0 african-pattern-mask opacity-[0.03] pointer-events-none" />
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] glow-primary pointer-events-none" />
          
          <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-16 w-full">
            <div className="grid gap-16 lg:grid-cols-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 space-y-10"
              >
                <div className="space-y-6">
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 rounded-full border border-primary-400/20 bg-primary-950/40 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-400"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    Propulsé par la confiance · Togo
                  </motion.span>
                  <h1 className="text-display-xl tracking-tight leading-[0.95] text-balance text-neutral-0">
                    Zéro palabre. <br />
                    Formalisez vos <br />
                    engagements.
                  </h1>
                  <p className="max-w-lg text-lg md:text-xl text-neutral-400 leading-relaxed font-medium">
                    Prêts, locations, prestations — transformez vos accords verbaux en preuves numériques certifiées en moins de 2 minutes.
                  </p>
                </div>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <Button size="lg" className="h-14 px-10 text-base rounded-2xl shadow-xl shadow-primary-700/20" asChild>
                    <Link href="/inscription">
                      Démarrer maintenant
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="h-14 px-8 text-neutral-300 hover:text-neutral-0 hover:bg-neutral-800/50 rounded-2xl" asChild>
                    <Link href="#comment-ca-marche">Explorer la méthode</Link>
                  </Button>
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-neutral-950 bg-neutral-800 flex items-center justify-center overflow-hidden relative">
                        <Image src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-neutral-500 italic">
                    Déjà +1,200 accords certifiés ce mois-ci
                  </p>
                </div>
              </motion.div>

              {/* Liquid Glass Hero Asset */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                className="lg:col-span-5 hidden lg:block perspective-1000"
              >
                <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8">
                     <div className="h-20 w-20 rounded-3xl bg-primary-600/20 flex flex-col items-center justify-center border border-primary-500/30">
                        <span className="text-2xl font-black text-primary-400 font-mono">2</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary-300">MIN</span>
                     </div>
                  </div>
                  
                  <div className="space-y-8 relative z-10">
                    <div className="space-y-2">
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary-500">Document Sécurisé</p>
                      <h2 className="text-3xl font-extrabold tracking-tighter">Accord de Prestation Photo</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100/10">
                        <span className="text-sm font-medium text-neutral-400">Montant</span>
                        <span className="font-mono text-lg font-bold text-primary-400">125 000 FCFA</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100/10">
                        <span className="text-sm font-medium text-neutral-400">Date d&apos;échéance</span>
                        <span className="font-mono text-sm font-bold text-neutral-200">24 JUIN 2026</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl bg-primary-600/10 p-5 border border-primary-500/20">
                      <div className="h-10 w-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary-300">Statut Certifié</p>
                        <p className="text-sm font-medium text-neutral-100">ZP-2026-X8802</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Value Prop — Bento Inspired */}
        <section className="py-32 relative">
          <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
            <div className="space-y-4 max-w-3xl mb-16">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-balance leading-[1.1] text-neutral-50">
                Pourquoi choisir <span className="text-primary-400">Zéro-Palabre</span> ?
              </h2>
              <p className="text-lg text-neutral-400 font-medium">
                Parce que la confiance ne suffit pas toujours, nous créons la preuve qui protège vos relations.
              </p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {features.map((f) => (
                <motion.div key={f.title} variants={itemVariants}>
                  <Card variant="light" interactive className="h-full p-8 space-y-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-700">
                      <f.icon className="h-7 w-7" strokeWidth={2} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold tracking-tight text-neutral-900">{f.title}</h3>
                      <p className="text-sm leading-relaxed text-neutral-500">{f.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* The Process — Visual Cascade */}
        <section id="comment-ca-marche" className="py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-300/30 to-transparent" />
          
          <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
            <div className="flex flex-col lg:flex-row gap-16 items-start">
              <div className="lg:sticky lg:top-32 max-w-md space-y-6">
                 <h2 className="text-4xl font-black tracking-tight leading-none text-neutral-50">
                  Un processus <span className="text-primary-400">fluide</span>.
                 </h2>
                 <p className="text-lg text-neutral-400 font-medium">
                  En quatre étapes simples, sécurisez n&apos;importe quel échange du quotidien.
                 </p>
                 <div className="pt-4">
                   <Button asChild variant="outline" className="rounded-xl">
                    <Link href="/inscription">Démarrer maintenant</Link>
                   </Button>
                 </div>
              </div>

              <div className="flex-1 space-y-6">
                {steps.map((step, idx) => (
                  <motion.div 
                    key={step.n}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card flex gap-6 p-8 rounded-[2rem] hover-lift group"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-neutral-100 flex items-center justify-center text-xl font-black text-neutral-300 group-hover:bg-primary-700 group-hover:text-neutral-0 transition-colors">
                      {step.n}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold tracking-tight text-neutral-900">{step.title}</h3>
                      <p className="text-neutral-500 leading-relaxed font-medium">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA — Emotional Peak */}
        <section className="py-32 bg-primary-800 text-neutral-0 relative overflow-hidden">
          <div className="absolute inset-0 african-pattern-mask opacity-[0.05]" />
          <div className="relative mx-auto max-w-4xl px-6 text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]">
                Dites adieu aux <br />
                <span className="text-primary-400">malentendus</span>.
              </h2>
              <p className="mt-8 text-xl text-primary-100/80 font-medium max-w-2xl mx-auto leading-relaxed">
                Rejoignez la nouvelle génération qui préfère une preuve claire à une longue palabre. Sécurisez vos relations dès aujourd&apos;hui.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button
                size="lg"
                className="h-16 px-12 text-lg rounded-2xl bg-neutral-0 text-primary-900 hover:bg-primary-50 hover:scale-105 transition-all shadow-2xl"
                asChild
              >
                <Link href="/inscription">Créer mon premier accord gratuitement</Link>
              </Button>
              <p className="mt-6 text-sm font-bold text-primary-400 uppercase tracking-widest">
                Sans carte bancaire · 3 accords offerts
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}


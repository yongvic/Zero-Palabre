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
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Moins de 2 minutes",
    description:
      "Créez et envoyez un accord depuis votre smartphone, sans compétence juridique.",
  },
  {
    icon: FileCheck,
    title: "Preuve PDF horodatée",
    description:
      "PDF avec QR de vérification, hash SHA-256 et identifiant unique ZP-YYYY-XXXXX.",
  },
  {
    icon: Handshake,
    title: "Validation mutuelle",
    description:
      "Le destinataire accepte ou refuse en un clic — sans compte obligatoire.",
  },
  {
    icon: Shield,
    title: "Score de fiabilité",
    description:
      "Construisez une réputation d'accords honorés pour vos échanges futurs.",
  },
];

const steps = [
  { n: "01", title: "Décrivez l'accord", desc: "Type, parties, montant, échéance." },
  { n: "02", title: "Envoyez l'invitation", desc: "Email sécurisé au destinataire." },
  { n: "03", title: "Validation", desc: "Acceptation ou refus documenté." },
  { n: "04", title: "Preuve téléchargeable", desc: "PDF partageable à vie sur la plateforme." },
];

const plans = [
  {
    name: "Gratuit",
    price: "0 FCFA",
    limit: "3 accords / mois",
    features: ["PDF horodaté", "Vérification publique", "Score de base"],
  },
  {
    name: "Starter",
    price: "2 500 FCFA",
    limit: "20 accords / mois",
    features: ["Tout Gratuit", "Rappels email", "Support email"],
    highlight: true,
  },
  {
    name: "Pro",
    price: "7 500 FCFA",
    limit: "100 accords / mois",
    features: ["Tout Starter", "Modèles métiers", "Export données"],
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader dark />
      <main>
        {/* Hero — inspiration dark agency, accent teal */}
        <section className="relative overflow-hidden bg-neutral-950 text-neutral-0">
          <div className="pointer-events-none absolute inset-0 glow-teal-dark" />
          <div className="relative mx-auto max-w-container px-4 pb-24 pt-12 md:px-10 md:pb-32 md:pt-20 lg:px-20">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="page-enter max-w-xl">
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-950/50 px-4 py-1.5 text-xs font-medium text-primary-300">
                  <Smartphone className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Mobile-first · Togo & Afrique de l&apos;Ouest
                </span>
                <h1 className="text-display-xl text-neutral-0">
                  Zéro palabre.
                  <br />
                  <span className="text-primary-400">Preuve claire</span> de vos accords.
                </h1>
                <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-400 md:text-lg">
                  Prêts, prestations, locations, commandes — formalisez vos engagements verbaux en accord numérique validé, avec PDF horodaté et vérifiable.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/inscription">
                      Créer mon premier accord
                      <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" asChild className="border-neutral-600 text-neutral-0 hover:bg-neutral-800 hover:text-neutral-0">
                    <Link href="#comment-ca-marche">Voir comment ça marche</Link>
                  </Button>
                </div>
              </div>

              <div className="page-enter relative hidden lg:block" style={{ animationDelay: "100ms" }}>
                <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-xl backdrop-blur">
                  <div className="absolute -right-4 -top-4 flex h-24 w-24 flex-col items-center justify-center rounded-2xl border border-primary-600/40 bg-primary-950 text-center">
                    <span className="text-3xl font-extrabold tracking-tight text-primary-400">2</span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-primary-300">min</span>
                  </div>
                  <p className="text-sm font-medium text-primary-400">Accord type — Prêt</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">Remboursement matériel photo</h2>
                  <p className="mt-4 text-sm text-neutral-400">150 000 FCFA · échéance 30 juin 2026</p>
                  <div className="mt-6 flex items-center gap-3 rounded-lg bg-primary-950/60 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-400" strokeWidth={1.5} />
                    <span className="text-sm text-neutral-200">Statut : Validé · ZP-2026-00042</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats band */}
        <section className="border-b border-neutral-150 bg-neutral-0 py-16">
          <div className="mx-auto grid max-w-container gap-8 px-4 md:grid-cols-3 md:px-10 lg:px-20">
            {[
              { value: "2 min", label: "Temps moyen de création" },
              { value: "72h", label: "Validité du lien d'invitation" },
              { value: "100%", label: "Traçabilité des événements" },
            ].map((s) => (
              <div key={s.label} className="text-center md:text-left">
                <p className="text-3xl font-extrabold tracking-tight text-primary-800">{s.value}</p>
                <p className="mt-1 text-sm text-neutral-600">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="fonctionnalites" className="py-20 md:py-28">
          <div className="mx-auto max-w-container px-4 md:px-10 lg:px-20">
            <h2 className="text-heading-xl max-w-2xl text-neutral-900">
              Simple, rapide, fiable — des accords qui tiennent la route
            </h2>
            <p className="mt-4 max-w-xl text-neutral-600">
              Pensé pour artisans, commerçants, freelances et particuliers qui vivent encore trop d&apos;accords « sur parole ».
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <Card key={f.title} className="page-enter">
                  <f.icon className="mb-4 h-8 w-8 text-primary-700" strokeWidth={1.5} />
                  <CardHeader className="p-0">
                    <CardTitle className="text-base">{f.title}</CardTitle>
                    <CardDescription>{f.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="comment-ca-marche" className="bg-primary-50 py-20 md:py-28">
          <div className="mx-auto max-w-container px-4 md:px-10 lg:px-20">
            <h2 className="text-heading-xl text-neutral-900">Comment ça marche</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div
                  key={step.n}
                  className="rounded-lg border border-primary-200 bg-neutral-0 p-6 shadow-xs"
                >
                  <span className="text-sm font-bold text-primary-800">{step.n}</span>
                  <h3 className="mt-2 font-semibold text-neutral-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="tarifs" className="py-20 md:py-28">
          <div className="mx-auto max-w-container px-4 md:px-10 lg:px-20">
            <h2 className="text-heading-xl text-neutral-900">Tarifs transparents</h2>
            <p className="mt-4 text-neutral-600">3 accords gratuits sans carte. Paiement simulé en MVP (Tmoney-Moov test).</p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={plan.highlight ? "border-primary-400 ring-2 ring-primary-200" : ""}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <p className="text-2xl font-bold text-primary-800">{plan.price}<span className="text-sm font-normal text-neutral-500">/mois</span></p>
                    <CardDescription>{plan.limit}</CardDescription>
                  </CardHeader>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-700" strokeWidth={1.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-800 py-20 text-neutral-0 md:py-24">
          <div className="mx-auto max-w-container px-4 text-center md:px-10 lg:px-20">
            <h2 className="text-display-l text-neutral-0">Un projet en tête ? Formalisez-le.</h2>
            <p className="mx-auto mt-4 max-w-lg text-primary-100">
              Rejoignez ceux qui préfèrent une preuve claire à une longue palabre.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8 border-neutral-0 bg-neutral-0 text-primary-800 hover:bg-primary-50"
              asChild
            >
              <Link href="/inscription">Commencer gratuitement</Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-container px-4 md:max-w-2xl md:px-10 lg:px-20">
            <h2 className="text-heading-xl text-neutral-900">Questions fréquentes</h2>
            <dl className="mt-10 space-y-8">
              {[
                {
                  q: "Est-ce un contrat juridique ?",
                  a: "Non. Zéro-Palabre formalise et horodate un accord entre parties. C'est une preuve de bonne foi, pas un acte notarié.",
                },
                {
                  q: "Le destinataire doit-il s'inscrire ?",
                  a: "Non pour valider. Un compte lui est proposé après acceptation pour retrouver ses accords.",
                },
                {
                  q: "Comment vérifier un PDF ?",
                  a: "Scannez le QR code ou visitez zeropalabre.com/verifier avec l'identifiant de l'accord.",
                },
              ].map((item) => (
                <div key={item.q} className="border-b border-neutral-150 pb-8">
                  <dt className="font-semibold text-neutral-900">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-neutral-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

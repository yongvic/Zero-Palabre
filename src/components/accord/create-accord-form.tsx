"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Briefcase,
  Package,
  ShoppingCart,
  Wrench,
  User,
  Check,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CreateAccordInput } from "@/lib/validations/accord";

const TYPES = [
  { id: "PRET", label: "Prêt d'argent / matériel", icon: Banknote, desc: "Remboursement de fonds ou de biens prêtés à un tiers." },
  { id: "PRESTATION", label: "Prestation de service", icon: Briefcase, desc: "Engagement sur des travaux, développement, design ou conseil." },
  { id: "LOCATION", label: "Location", icon: Wrench, desc: "Mise à disposition de matériel, local, véhicule ou équipement." },
  { id: "COMMANDE", label: "Commande de produit", icon: ShoppingCart, desc: "Achat, fabrication ou livraison de biens physiques." },
  { id: "AUTRE", label: "Autre accord", icon: Package, desc: "Tout autre engagement verbal ou promesse formelle à sceller." },
] as const;

const STEPS = ["Type d'accord", "Parties", "Détails & termes", "Aperçu final"];

export function CreateAccordForm({
  initiateurName,
  initiateurEmail,
}: {
  initiateurName: string;
  initiateurEmail: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Partial<CreateAccordInput>>({
    type: "PRET",
    devise: "FCFA",
  });

  async function submit() {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("Connexion Internet requise pour envoyer un accord.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/accords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error?.message ?? "Erreur lors de la création");
      if (json.error?.code === "QUOTA_EXCEEDED") {
        router.push("/abonnement");
      }
      return;
    }
    router.push(`/accords/${json.data.id}`);
  }

  const isStepValid = () => {
    if (step === 1) {
      return !!data.destinataireNom && !!data.destinataireEmail;
    }
    if (step === 2) {
      return !!data.titre && !!data.description && data.description.length >= 20;
    }
    return true;
  };

  const nextStep = () => isStepValid() && setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  return (
    <div className="space-y-12">
      {/* Stepper Logic */}
      <div className="relative">
        <div className="flex items-center justify-between relative">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center flex-1 relative z-10">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold text-sm transition-all duration-300",
                  i === step
                    ? "border-primary-700 bg-primary-700 text-neutral-0 shadow-lg scale-110"
                    : i < step
                      ? "border-primary-600 bg-primary-50 text-primary-700 hover:bg-primary-100"
                      : "border-neutral-200 bg-neutral-0 text-neutral-400 cursor-not-allowed"
                )}
              >
                {i < step ? <Check className="h-5 w-5" strokeWidth={3} /> : <span>{i + 1}</span>}
              </button>
              <span className={cn(
                "mt-3 text-[10px] font-black uppercase tracking-[0.1em] transition-colors duration-300 hidden md:block",
                i <= step ? "text-neutral-900" : "text-neutral-300"
              )}>
                {s}
              </span>
            </div>
          ))}
          {/* Progress Line */}
          <div className="absolute top-5 left-0 w-full h-[2px] bg-neutral-100 -z-0" />
          <motion.div 
            initial={false}
            animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            className="absolute top-5 left-0 h-[2px] bg-primary-600 -z-0" 
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {step === 0 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-neutral-900">Type d&apos;engagement</h3>
                  <p className="text-sm text-neutral-500 font-medium">Sélectionnez la catégorie qui correspond le mieux à votre accord.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {TYPES.map((t) => {
                    const Icon = t.icon;
                    const selected = data.type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setData({ ...data, type: t.id })}
                        className={cn(
                          "group relative flex items-start gap-4 rounded-[1.5rem] border p-6 text-left transition-all hover:shadow-md",
                          selected 
                            ? "border-primary-600 bg-primary-50/30 ring-1 ring-primary-600" 
                            : "border-neutral-200 bg-neutral-0 hover:border-primary-200"
                        )}
                      >
                        <div className={cn(
                          "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center transition-colors",
                          selected ? "bg-primary-700 text-neutral-0" : "bg-neutral-100 text-neutral-500 group-hover:bg-primary-50 group-hover:text-primary-700"
                        )}>
                          <Icon className="h-6 w-6" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-neutral-900">{t.label}</p>
                          <p className="text-xs font-medium text-neutral-500 leading-relaxed">{t.desc}</p>
                        </div>
                        {selected && (
                          <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary-700 text-neutral-0 flex items-center justify-center">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-neutral-900">Parties concernées</h3>
                  <p className="text-sm text-neutral-500 font-medium">Qui scelle cet accord avec vous ?</p>
                </div>
                <div className="grid gap-6">
                  <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Initiateur (Vous)</p>
                      <p className="text-sm font-bold text-neutral-900">{initiateurName} · {initiateurEmail}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="destinataireNom" className="text-xs font-black uppercase tracking-widest text-neutral-500">Nom du partenaire</Label>
                      <Input
                        id="destinataireNom"
                        placeholder="Ex: Koffi Mensah"
                        className="h-14 rounded-2xl text-lg font-bold px-6"
                        value={data.destinataireNom ?? ""}
                        onChange={(e) => setData({ ...data, destinataireNom: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinataireEmail" className="text-xs font-black uppercase tracking-widest text-neutral-500">Email du partenaire</Label>
                      <Input
                        id="destinataireEmail"
                        type="email"
                        placeholder="koffi.m@email.com"
                        className="h-14 rounded-2xl text-lg font-bold px-6 font-mono"
                        value={data.destinataireEmail ?? ""}
                        onChange={(e) => setData({ ...data, destinataireEmail: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-neutral-900">Termes de l&apos;accord</h3>
                  <p className="text-sm text-neutral-500 font-medium">Définissez précisément les modalités de votre engagement.</p>
                </div>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="titre" className="text-xs font-black uppercase tracking-widest text-neutral-500">Objet de l&apos;accord</Label>
                    <Input
                      id="titre"
                      placeholder="Ex: Remboursement prêt moto"
                      className="h-14 rounded-2xl text-lg font-bold px-6"
                      value={data.titre ?? ""}
                      onChange={(e) => setData({ ...data, titre: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="montant" className="text-xs font-black uppercase tracking-widest text-neutral-500">Montant (FCFA)</Label>
                      <Input
                        id="montant"
                        type="number"
                        placeholder="150 000"
                        className="h-14 rounded-2xl text-lg font-bold px-6 font-mono"
                        value={data.montant ?? ""}
                        onChange={(e) => setData({ ...data, montant: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateEcheance" className="text-xs font-black uppercase tracking-widest text-neutral-500">Échéance</Label>
                      <Input
                        id="dateEcheance"
                        type="date"
                        className="h-14 rounded-2xl text-lg font-bold px-6"
                        value={data.dateEcheance ?? ""}
                        onChange={(e) => setData({ ...data, dateEcheance: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-neutral-500">Description détaillée</Label>
                    <textarea
                      id="description"
                      rows={5}
                      placeholder="Décrivez ici les détails, conditions de remboursement, pénalités..."
                      className="w-full rounded-3xl border border-neutral-200 p-6 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      value={data.description ?? ""}
                      onChange={(e) => setData({ ...data, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="space-y-1 text-center">
                  <h3 className="text-2xl font-black tracking-tighter text-neutral-900">Aperçu avant scellage.</h3>
                  <p className="text-sm text-neutral-500 font-medium">Vérifiez scrupuleusement les informations avant l&apos;envoi.</p>
                </div>
                <div className="relative bg-paper rounded-[2rem] border border-neutral-200 p-8 shadow-paper overflow-hidden">
                  <div className="watermark-seal opacity-[0.03]" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-start pb-6 border-b border-neutral-100">
                      <div>
                        <Badge variant="pending">En attente de signature</Badge>
                        <h4 className="text-2xl font-black text-neutral-950 mt-3">{data.titre}</h4>
                      </div>
                      <p className="font-mono text-xs font-bold text-neutral-400">REFERENCE: ZP-2026-TEMP</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 text-sm font-medium">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Initiateur</p>
                        <p className="text-neutral-900">{initiateurName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Destinataire</p>
                        <p className="text-neutral-900">{data.destinataireNom}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Montant de l&apos;accord</p>
                      <p className="text-3xl font-black text-primary-700 font-mono">
                        {data.montant?.toLocaleString()} {data.devise}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-error-600/10 border border-error-600/20 text-error-600 text-sm font-bold">
          {error}
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-8 border-t border-neutral-100">
        <Button
          variant="ghost"
          disabled={step === 0 || loading}
          onClick={prevStep}
          className="rounded-xl h-12 px-6 font-bold text-neutral-500"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Retour
        </Button>
        
        {step < 3 ? (
          <Button 
            onClick={nextStep}
            disabled={!isStepValid()}
            className="rounded-xl h-12 px-8 font-black tracking-tight"
          >
            Suivant
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={submit} 
            loading={loading}
            className="rounded-xl h-12 px-10 font-black tracking-tight shadow-xl shadow-primary-700/20"
          >
            <ShieldCheck className="h-5 w-5 mr-2" />
            Sceller l&apos;accord
          </Button>
        )}
      </div>
    </div>
  );
}


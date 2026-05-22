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
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Check,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CreateAccordInput } from "@/lib/validations/accord";

const TYPES = [
  { id: "PRET", label: "Prêt d'argent / matériel", icon: Banknote, desc: "Remboursement de fonds ou de biens prêtés à un tiers." },
  { id: "PRESTATION", label: "Prestation de service", icon: Briefcase, desc: "Engagement sur des travaux, développement, design ou conseil." },
  { id: "LOCATION", label: "Location", icon: Wrench, desc: "Mise à disposition de matériel, local, véhicule ou équipement." },
  { id: "COMMANDE", label: "Commande de produit", icon: ShoppingCart, desc: "Achat, fabrication ou livraison de biens physiques." },
  { id: "AUTRE", label: "Autre accord", icon: Package, desc: "Tout autre engagement verbal ou promesse formelle à sceller." },
] as const;

const STEPS = ["Type d'accord", "Parties concernées", "Détails & termes", "Aperçu final"];

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

  return (
    <div className="space-y-8">
      {/* 1. Stepper Responsive Ultra Premium */}
      <div className="relative">
        {/* Stepper complet pour Desktop & Tablette */}
        <div className="hidden md:flex items-center justify-between relative z-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center flex-1 relative">
              {/* Ligne de liaison entre les étapes */}
              {i < STEPS.length - 1 && (
                <div 
                  className={cn(
                    "absolute top-5 left-[50%] right-[-50%] h-[2px] z-[-1] transition-colors duration-300",
                    i < step ? "bg-primary-600" : "bg-neutral-200"
                  )}
                />
              )}
              
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i >= step}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-800/30",
                  i === step
                    ? "border-primary-800 bg-primary-800 text-neutral-0 shadow-md scale-110"
                    : i < step
                      ? "border-primary-600 bg-primary-50 text-primary-800 cursor-pointer hover:bg-primary-100"
                      : "border-neutral-200 bg-neutral-0 text-neutral-400 cursor-not-allowed"
                )}
              >
                {i < step ? (
                  <Check className="h-4.5 w-4.5" strokeWidth={3} />
                ) : (
                  <span>{i + 1}</span>
                )}
              </button>
              
              <span 
                className={cn(
                  "mt-3 text-xs font-semibold tracking-tight transition-colors duration-300",
                  i === step ? "text-primary-800" : i < step ? "text-neutral-700" : "text-neutral-400"
                )}
              >
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Stepper compact pour Mobile */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-800">
              Étape {step + 1} sur 4
            </span>
            <span className="text-sm font-bold text-neutral-900">
              {STEPS[step]}
            </span>
          </div>
          {/* Barre de progression fluide */}
          <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
            <div 
              className="h-full bg-primary-800 transition-all duration-300 ease-out"
              style={{ width: `${((step + 1) / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Contenu des Étapes de Formulaire */}
      <div className="min-h-[280px]">
        {/* ÉTAPE 0 : Choix du type (Grille interactive de cartes premium) */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="text-center md:text-left mb-6">
              <h3 className="text-base font-bold text-neutral-900">De quel type d&apos;engagement s&apos;agit-il ?</h3>
              <p className="text-xs text-neutral-500 mt-1">Sélectionnez le type d&apos;accord pour structurer convenablement la preuve numérique.</p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {TYPES.map((t) => {
                const IconComponent = t.icon;
                const isSelected = data.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setData({ ...data, type: t.id })}
                    className={cn(
                      "group relative flex items-start gap-4 rounded-xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-800/30",
                      isSelected
                        ? "border-primary-800 bg-primary-50/40 ring-1 ring-primary-800"
                        : "border-neutral-200 bg-neutral-0 hover:border-neutral-300"
                    )}
                  >
                    <div className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
                      isSelected ? "bg-primary-800 text-neutral-0" : "bg-neutral-100 text-neutral-600 group-hover:bg-primary-50 group-hover:text-primary-800"
                    )}>
                      <IconComponent className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1 pr-4">
                      <span className="block text-sm font-bold text-neutral-900">{t.label}</span>
                      <span className="block text-xs leading-relaxed text-neutral-500">{t.desc}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary-800 text-neutral-0">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ÉTAPE 1 : Parties concernées (Inputs aérés avec icônes) */}
        {step === 1 && (
          <Card className="p-6 md:p-8 space-y-6 rounded-2xl border border-neutral-150 shadow-sm bg-neutral-0">
            <div className="border-b border-neutral-100 pb-4">
              <h3 className="text-base font-bold text-neutral-900">Les parties contractantes</h3>
              <p className="text-xs text-neutral-500 mt-1">Saisissez l&apos;identité et les coordonnées sécurisées du destinataire.</p>
            </div>

            <div className="grid gap-6">
              {/* Initiateur (Lecture seule premium) */}
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-4">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">Initiateur de l&apos;accord (Vous)</span>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-neutral-600">
                    <User className="h-4.5 w-4.5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-neutral-900">{initiateurName}</span>
                    <span className="block text-xs text-neutral-500 font-mono mt-0.5">{initiateurEmail}</span>
                  </div>
                </div>
              </div>

              {/* Nom du destinataire */}
              <div className="space-y-2">
                <Label htmlFor="destinataireNom" className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Nom du destinataire *
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400">
                    <User className="h-4.5 w-4.5" strokeWidth={1.5} />
                  </div>
                  <Input
                    id="destinataireNom"
                    placeholder="Ex: Koffi Mensah"
                    className="min-h-[48px] pl-11 rounded-xl border-[1.5px] border-neutral-200 text-[15px] focus:border-primary-800 focus:shadow-focus-primary focus:outline-none placeholder:text-neutral-400 transition-all"
                    value={data.destinataireNom ?? ""}
                    onChange={(e) => setData({ ...data, destinataireNom: e.target.value })}
                  />
                </div>
              </div>

              {/* Email du destinataire */}
              <div className="space-y-2">
                <Label htmlFor="destinataireEmail" className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Email du destinataire *
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400">
                    <Mail className="h-4.5 w-4.5" strokeWidth={1.5} />
                  </div>
                  <Input
                    id="destinataireEmail"
                    type="email"
                    placeholder="Ex: koffi.mensah@email.com"
                    className="min-h-[48px] pl-11 rounded-xl border-[1.5px] border-neutral-200 text-[15px] focus:border-primary-800 focus:shadow-focus-primary focus:outline-none placeholder:text-neutral-400 transition-all"
                    value={data.destinataireEmail ?? ""}
                    onChange={(e) => setData({ ...data, destinataireEmail: e.target.value })}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 italic">
                  Un lien sécurisé unique lui sera transmis par email pour valider numériquement l&apos;accord.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ÉTAPE 2 : Détails & termes (Formulaire aéré, sélections de devises) */}
        {step === 2 && (
          <Card className="p-6 md:p-8 space-y-6 rounded-2xl border border-neutral-150 shadow-sm bg-neutral-0">
            <div className="border-b border-neutral-100 pb-4">
              <h3 className="text-base font-bold text-neutral-900">Termes et détails financiers</h3>
              <p className="text-xs text-neutral-500 mt-1">Formalisez de manière claire les modalités de cet accord numérique.</p>
            </div>

            <div className="grid gap-5">
              {/* Titre de l'accord */}
              <div className="space-y-2">
                <Label htmlFor="titre" className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Titre de l&apos;accord *
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400">
                    <FileText className="h-4.5 w-4.5" strokeWidth={1.5} />
                  </div>
                  <Input
                    id="titre"
                    placeholder="Ex: Remboursement du prêt pour matériel photo"
                    className="min-h-[48px] pl-11 rounded-xl border-[1.5px] border-neutral-200 text-[15px] focus:border-primary-800 focus:shadow-focus-primary focus:outline-none placeholder:text-neutral-400 transition-all animate-none"
                    value={data.titre ?? ""}
                    onChange={(e) => setData({ ...data, titre: e.target.value })}
                  />
                </div>
              </div>

              {/* Ligne : Montant & Devise */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="montant" className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Montant (optionnel)
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400">
                      <DollarSign className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </div>
                    <Input
                      id="montant"
                      type="number"
                      min={0}
                      placeholder="Ex: 150000"
                      className="min-h-[48px] pl-11 rounded-xl border-[1.5px] border-neutral-200 text-[15px] focus:border-primary-800 focus:shadow-focus-primary focus:outline-none placeholder:text-neutral-400 transition-all"
                      value={data.montant ?? ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          montant: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="devise" className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Devise
                  </Label>
                  <select
                    id="devise"
                    className="flex h-12 w-full rounded-xl border-[1.5px] border-neutral-200 px-3.5 text-[15px] font-semibold bg-neutral-0 focus:border-primary-800 focus:shadow-focus-primary focus:outline-none transition-all cursor-pointer"
                    value={data.devise ?? "FCFA"}
                    onChange={(e) =>
                      setData({
                        ...data,
                        devise: e.target.value as "FCFA" | "EUR" | "USD",
                      })
                    }
                  >
                    <option value="FCFA">FCFA (CFA)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* Date d'échéance */}
              <div className="space-y-2">
                <Label htmlFor="dateEcheance" className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Date d&apos;échéance (optionnelle)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400">
                    <Calendar className="h-4.5 w-4.5" strokeWidth={1.5} />
                  </div>
                  <Input
                    id="dateEcheance"
                    type="date"
                    className="min-h-[48px] pl-11 rounded-xl border-[1.5px] border-neutral-200 text-[15px] focus:border-primary-800 focus:shadow-focus-primary focus:outline-none transition-all cursor-pointer"
                    value={data.dateEcheance ?? ""}
                    onChange={(e) => setData({ ...data, dateEcheance: e.target.value || undefined })}
                  />
                </div>
              </div>

              {/* Description détaillée */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Description et termes détaillés *
                  </Label>
                  {data.description && (
                    <span className={cn(
                      "text-[10px] font-bold tracking-tight",
                      data.description.length >= 20 ? "text-success-800 bg-success-50 px-2 py-0.5 rounded" : "text-error-600"
                    )}>
                      {data.description.length} car. (min 20)
                    </span>
                  )}
                </div>
                <textarea
                  id="description"
                  placeholder="Décrivez de manière claire et non-équivoque les termes de votre accord (Ex: remboursement en 3 traites égales, pénalités de retard, matériel restitué en l'état...)"
                  className="min-h-[140px] w-full resize-y rounded-xl border-[1.5px] border-neutral-200 px-4 py-3 text-[15px] leading-relaxed focus:border-primary-800 focus:shadow-focus-primary focus:outline-none transition-all placeholder:text-neutral-400"
                  value={data.description ?? ""}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                />
              </div>
            </div>
          </Card>
        )}

        {/* ÉTAPE 3 : Aperçu final format document scellé */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center md:text-left mb-4">
              <h3 className="text-base font-bold text-neutral-900">Aperçu en temps réel de votre accord</h3>
              <p className="text-xs text-neutral-500 mt-1">Voici le document numérique tel qu&apos;il apparaîtra à votre destinataire pour sa signature numérique.</p>
            </div>

            {/* Document scellé virtuel */}
            <div className="relative overflow-hidden rounded-2xl border border-neutral-150 bg-paper shadow-paper p-6 md:p-8">
              <div className="watermark-seal" />
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-800 to-amber-600" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start border-b border-neutral-100 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase border border-amber-200">
                      En attente de signature
                    </span>
                    <h4 className="text-lg font-extrabold text-neutral-950 mt-2 tracking-tight">
                      {data.titre || "Accord sans titre"}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 border border-neutral-150 px-2.5 py-1 rounded-full self-start">
                    ZP-2026-Nouveau
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-neutral-50/50 border border-neutral-100 p-3 text-xs">
                    <span className="block font-bold text-neutral-500 uppercase tracking-wider text-[9px]">Créé par (Initiateur)</span>
                    <span className="block font-bold text-neutral-900 mt-1">{initiateurName}</span>
                    <span className="block text-neutral-400 font-mono text-[10px] mt-0.5">{initiateurEmail}</span>
                  </div>
                  <div className="rounded-lg bg-neutral-50/50 border border-neutral-100 p-3 text-xs">
                    <span className="block font-bold text-neutral-500 uppercase tracking-wider text-[9px]">Destiné à (Signataire)</span>
                    <span className="block font-bold text-neutral-900 mt-1">{data.destinataireNom || "Non spécifié"}</span>
                    <span className="block text-neutral-400 font-mono text-[10px] mt-0.5">{data.destinataireEmail || "Non spécifié"}</span>
                  </div>
                </div>

                {data.montant && (
                  <div className="rounded-lg bg-primary-50/30 border border-primary-100 p-4 text-center md:text-left">
                    <span className="block font-bold text-primary-800 uppercase tracking-wider text-[9px] mb-1">Engagement financier total</span>
                    <span className="text-2xl font-black text-primary-800">
                      {Number(data.montant).toLocaleString()} {data.devise}
                    </span>
                    {data.dateEcheance && (
                      <span className="block text-[11px] font-semibold text-neutral-600 mt-1 bg-neutral-0/80 px-2 py-0.5 rounded border border-neutral-150 w-fit">
                        Échéance fixée au : {new Date(data.dateEcheance).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <span className="block font-bold text-neutral-500 uppercase tracking-wider text-[9px] pb-1 border-b border-neutral-100">
                    Termes contractuels
                  </span>
                  <div className="bg-neutral-0/60 p-4 rounded-xl border border-neutral-100 text-[13.5px] leading-relaxed text-neutral-800 whitespace-pre-wrap min-h-[80px]">
                    {data.description || "Aucune description détaillée n'a été saisie."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="page-enter rounded-xl border border-error-100 bg-error-50/50 p-4 text-sm font-semibold text-error-800 flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* 3. Boutons de navigation (Touch targets robustes) */}
      <div className="flex justify-between items-center pt-6 border-t border-neutral-150">
        <Button
          variant="ghost"
          disabled={step === 0 || loading}
          onClick={() => setStep((s) => s - 1)}
          className="min-h-[46px] rounded-xl font-semibold gap-1.5"
        >
          <ChevronLeft className="h-5 w-5 shrink-0" strokeWidth={2} />
          Retour
        </Button>
        
        {step < 3 ? (
          <Button 
            onClick={() => setStep((s) => s + 1)}
            disabled={!isStepValid()}
            className="min-h-[46px] rounded-xl font-bold tracking-tight bg-primary-800 hover:bg-primary-700 active:bg-primary-900 gap-1.5 transition-all shadow-sm"
          >
            Continuer
            <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={2} />
          </Button>
        ) : (
          <Button 
            onClick={submit} 
            loading={loading}
            className="min-h-[46px] rounded-xl font-bold tracking-tight bg-primary-800 hover:bg-primary-700 active:bg-primary-900 gap-2 transition-all shadow-sm"
          >
            <ShieldCheck className="h-5 w-5 shrink-0" strokeWidth={2} />
            Envoyer et sceller l&apos;accord
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Briefcase,
  Package,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CreateAccordInput } from "@/lib/validations/accord";

const TYPES = [
  { id: "PRET", label: "Prêt", icon: Banknote },
  { id: "PRESTATION", label: "Prestation", icon: Briefcase },
  { id: "LOCATION", label: "Location", icon: Wrench },
  { id: "COMMANDE", label: "Commande", icon: ShoppingCart },
  { id: "AUTRE", label: "Autre", icon: Package },
] as const;

const STEPS = ["Type", "Parties", "Détails", "Récapitulatif"];

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

  return (
    <div>
      <div className="mb-8 flex gap-2 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
              i === step
                ? "bg-primary-800 text-neutral-0"
                : i < step
                  ? "bg-primary-100 text-primary-800"
                  : "bg-neutral-100 text-neutral-500"
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-current/10 text-xs">
              {i + 1}
            </span>
            {s}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setData({ ...data, type: t.id })}
              className={cn(
                "flex flex-col items-start gap-3 rounded-lg border p-5 text-left transition-colors",
                data.type === t.id
                  ? "border-primary-600 bg-primary-50"
                  : "border-neutral-200 bg-neutral-0 hover:border-neutral-300"
              )}
            >
              <t.icon className="h-8 w-8 text-primary-700" strokeWidth={1.5} />
              <span className="font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <Card className="space-y-4">
          <div>
            <Label>Initiateur</Label>
            <Input value={initiateurName} disabled />
            <p className="mt-1 text-xs text-neutral-500">{initiateurEmail}</p>
          </div>
          <div>
            <Label htmlFor="destinataireNom">Nom du destinataire *</Label>
            <Input
              id="destinataireNom"
              value={data.destinataireNom ?? ""}
              onChange={(e) =>
                setData({ ...data, destinataireNom: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="destinataireEmail">Email du destinataire *</Label>
            <Input
              id="destinataireEmail"
              type="email"
              value={data.destinataireEmail ?? ""}
              onChange={(e) =>
                setData({ ...data, destinataireEmail: e.target.value })
              }
            />
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="space-y-4">
          <div>
            <Label htmlFor="titre">Titre de l&apos;accord *</Label>
            <Input
              id="titre"
              value={data.titre ?? ""}
              onChange={(e) => setData({ ...data, titre: e.target.value })}
              placeholder="Ex : Remboursement prêt matériel"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="montant">Montant (optionnel)</Label>
              <Input
                id="montant"
                type="number"
                min={0}
                value={data.montant ?? ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    montant: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="devise">Devise</Label>
              <select
                id="devise"
                className="flex h-11 w-full rounded-md border-[1.5px] border-neutral-200 px-3.5 text-[15px]"
                value={data.devise ?? "FCFA"}
                onChange={(e) =>
                  setData({
                    ...data,
                    devise: e.target.value as "FCFA" | "EUR" | "USD",
                  })
                }
              >
                <option value="FCFA">FCFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="dateEcheance">Date d&apos;échéance (optionnel)</Label>
            <Input
              id="dateEcheance"
              type="date"
              value={data.dateEcheance ?? ""}
              onChange={(e) =>
                setData({ ...data, dateEcheance: e.target.value || undefined })
              }
            />
          </div>
          <div>
            <Label htmlFor="description">Description détaillée *</Label>
            <textarea
              id="description"
              className="min-h-[120px] w-full resize-y rounded-md border-[1.5px] border-neutral-200 px-3.5 py-3 text-[15px] leading-relaxed focus:border-primary-600 focus:shadow-focus-primary focus:outline-none"
              value={data.description ?? ""}
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
              placeholder="Décrivez les termes de l'accord (min. 20 caractères)..."
            />
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-3 text-sm">
          <p><span className="text-neutral-500">Type :</span> {data.type}</p>
          <p><span className="text-neutral-500">Titre :</span> {data.titre}</p>
          <p><span className="text-neutral-500">Destinataire :</span> {data.destinataireNom} ({data.destinataireEmail})</p>
          {data.montant && (
            <p><span className="text-neutral-500">Montant :</span> {data.montant} {data.devise}</p>
          )}
          <p className="whitespace-pre-wrap text-neutral-700">{data.description}</p>
        </Card>
      )}

      {error && <p className="mt-4 text-sm text-error-600">{error}</p>}

      <div className="mt-8 flex justify-between gap-4">
        <Button
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          Retour
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Continuer</Button>
        ) : (
          <Button onClick={submit} loading={loading}>
            Envoyer l&apos;invitation
          </Button>
        )}
      </div>
    </div>
  );
}

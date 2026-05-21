"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_PRICES_FCFA } from "@/lib/constants";

const plans = [
  { id: "STARTER", name: "Starter", limit: "20 accords/mois", price: PLAN_PRICES_FCFA.STARTER },
  { id: "PRO", name: "Pro", limit: "100 accords/mois", price: PLAN_PRICES_FCFA.PRO },
  { id: "BUSINESS", name: "Business", limit: "Illimité", price: PLAN_PRICES_FCFA.BUSINESS },
];

export default function AbonnementPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function subscribe(planId: string) {
    setLoading(planId);
    setMessage("");
    const res = await fetch("/api/subscription/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId }),
    });
    const json = await res.json();
    setLoading(null);
    if (json.data?.checkoutUrl) {
      window.location.href = json.data.checkoutUrl;
    } else if (json.data?.simulated) {
      setMessage(`Abonnement ${planId} activé (mode simulation MVP).`);
    } else {
      setMessage(json.error?.message ?? "Erreur");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-heading-xl text-neutral-900">Abonnement</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Paiements simulés en MVP (Tmoney-Moov mode test). Carte fictive : 4242 4242 4242 4242.
      </p>

      {message && (
        <p className="mt-4 rounded-md bg-primary-50 px-4 py-3 text-sm text-primary-800">
          {message}
        </p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-xl font-bold text-primary-800">
                {plan.price.toLocaleString("fr-FR")} FCFA
                <span className="text-sm font-normal text-neutral-500">/mois</span>
              </p>
              <CardDescription>{plan.limit}</CardDescription>
            </CardHeader>
            <ul className="mb-6 space-y-2 px-6 text-sm text-neutral-600">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary-700" strokeWidth={1.5} />
                PDF horodaté
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary-700" strokeWidth={1.5} />
                Support email
              </li>
            </ul>
            <div className="px-6 pb-6">
              <Button
                className="w-full"
                variant={plan.id === "PRO" ? "primary" : "secondary"}
                loading={loading === plan.id}
                onClick={() => subscribe(plan.id)}
              >
                Choisir {plan.name}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

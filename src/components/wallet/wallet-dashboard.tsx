"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Loader2, Smartphone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { formatMontant } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tx = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  label: string;
  paymentRef: string | null;
  rail: string | null;
  createdAt: string;
};

type WalletData = {
  balanceAvailable: number;
  balanceEscrow: number;
  currency: string;
  transactions: Tx[];
};

type FlowMode = "deposit" | "withdraw" | null;

export function WalletDashboard() {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [flow, setFlow] = useState<FlowMode>(null);
  const [rail, setRail] = useState<"TMONEY" | "FLOOZ">("TMONEY");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ ref: string; label: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/wallet");
    const json = await res.json();
    setLoading(false);
    if (res.ok) setData(json.data as WalletData);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitFlow() {
    if (!flow) return;
    setError("");
    setSuccess(null);
    setProcessing(true);
    setProcessingLabel(
      flow === "deposit"
        ? "Connexion à l'opérateur Mobile Money…"
        : "Traitement du retrait…"
    );

    const endpoint = flow === "deposit" ? "/api/wallet/deposit" : "/api/wallet/withdraw";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rail,
        phone: phone.trim(),
        amount: Number(amount),
      }),
    });
    const json = await res.json();
    setProcessing(false);
    setProcessingLabel("");

    if (!res.ok) {
      setError(json.error?.message ?? "Opération impossible");
      return;
    }

    setSuccess({
      ref: json.data.paymentRef as string,
      label: flow === "deposit" ? "Dépôt confirmé" : "Retrait envoyé",
    });
    setAmount("");
    setFlow(null);
    await load();
  }

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        <p className="text-sm text-neutral-600">Chargement du portefeuille…</p>
      </div>
    );
  }

  const available = data?.balanceAvailable ?? 0;
  const escrow = data?.balanceEscrow ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950">Portefeuille</h1>
        <p className="text-neutral-600">Dépôts et retraits via Tmoney ou Flooz.</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="bg-primary-800 px-6 py-8 text-white">
          <div className="flex items-center gap-2 text-primary-100 text-sm font-medium">
            <Wallet className="h-4 w-4" />
            Solde disponible
          </div>
          <p className="mt-2 font-mono text-4xl font-bold tabular-nums tracking-tight">
            {formatMontant(available, "FCFA")}
          </p>
          {escrow > 0 && (
            <p className="mt-3 text-sm text-primary-100/90">
              En escrow : {formatMontant(escrow, "FCFA")}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          <Button
            className="h-12 gap-2"
            onClick={() => {
              setFlow("deposit");
              setError("");
              setSuccess(null);
            }}
          >
            <ArrowDownLeft className="h-4 w-4" />
            Déposer
          </Button>
          <Button
            variant="secondary"
            className="h-12 gap-2"
            onClick={() => {
              setFlow("withdraw");
              setError("");
              setSuccess(null);
            }}
          >
            <ArrowUpRight className="h-4 w-4" />
            Retirer
          </Button>
        </div>
      </Card>

      {success && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-4 text-sm">
          <p className="font-semibold text-primary-900">{success.label}</p>
          <p className="mt-1 font-mono text-xs text-primary-800">Réf. {success.ref}</p>
        </div>
      )}

      {flow && (
        <Card className="space-y-5">
          <h2 className="text-lg font-bold text-neutral-950">
            {flow === "deposit" ? "Déposer des fonds" : "Retirer vers Mobile Money"}
          </h2>

          <div className="grid grid-cols-2 gap-2">
            {(["TMONEY", "FLOOZ"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRail(r)}
                className={cn(
                  "flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 text-sm font-semibold transition-colors",
                  rail === r
                    ? "border-primary-600 bg-primary-50 text-primary-800"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                )}
              >
                <Smartphone className="h-4 w-4" />
                {r === "TMONEY" ? "Tmoney" : "Flooz"}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-phone">Numéro Mobile Money</Label>
            <Input
              id="wallet-phone"
              placeholder="+228 90 00 00 00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-amount">Montant (FCFA)</Label>
            <Input
              id="wallet-amount"
              type="number"
              min={flow === "withdraw" ? 500 : 100}
              placeholder={flow === "withdraw" ? "5000" : "10000"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {processing && (
            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary-700" />
              {processingLabel}
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-800">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setFlow(null)} disabled={processing}>
              Annuler
            </Button>
            <Button
              className="flex-1"
              loading={processing}
              onClick={() => void submitFlow()}
              disabled={!phone.trim() || !amount || Number(amount) <= 0}
            >
              {flow === "deposit" ? "Confirmer le dépôt" : "Confirmer le retrait"}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Historique</h2>
        {!data?.transactions.length ? (
          <p className="text-sm text-neutral-500">Aucune opération pour le moment.</p>
        ) : (
          <ul className="space-y-2">
            {data.transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">{tx.label}</p>
                  {tx.paymentRef && (
                    <p className="truncate font-mono text-[11px] text-neutral-500">{tx.paymentRef}</p>
                  )}
                  <p className="text-[11px] text-neutral-400">
                    {new Date(tx.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 font-mono text-sm font-bold tabular-nums",
                    tx.type === "CREDIT" || tx.type === "TRANSFER_IN"
                      ? "text-primary-700"
                      : "text-neutral-800"
                  )}
                >
                  {tx.type === "CREDIT" || tx.type === "TRANSFER_IN" ? "+" : "−"}
                  {formatMontant(tx.amount, "FCFA")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

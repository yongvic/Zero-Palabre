"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InscriptionPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    acceptCgu: false,
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.acceptCgu) {
      setError("Vous devez accepter les CGU.");
      return;
    }
    setLoading(true);
    setError("");
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const res = await signIn("resend", {
      email: form.email,
      redirect: false,
      callbackUrl: "/accords/nouveau",
    });
    setLoading(false);
    if (res?.error) setError("Erreur lors de l'inscription.");
    else setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <Link href="/" className="mb-8">
        <Image src="/brand/logo-vert.png" alt="Zéro-Palabre" width={160} height={40} />
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>3 accords gratuits — sans carte bancaire.</CardDescription>
        </CardHeader>
        {sent ? (
          <p className="px-6 pb-6 text-sm text-neutral-600">
            Vérifiez <strong>{form.email}</strong> pour activer votre compte.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
            <div>
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <label className="flex items-start gap-3 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={form.acceptCgu}
                onChange={(e) => setForm({ ...form, acceptCgu: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-800"
              />
              J&apos;accepte les{" "}
              <Link href="/cgu" className="text-primary-800 underline">
                CGU
              </Link>{" "}
              et la politique de confidentialité.
            </label>
            {error && <p className="text-sm text-error-600">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}>
              Continuer
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

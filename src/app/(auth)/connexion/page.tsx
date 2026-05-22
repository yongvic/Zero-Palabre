"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("resend", {
      email,
      redirect: false,
      callbackUrl: "/accords",
    });
    setLoading(false);
    if (res?.error) {
      setError("Impossible d'envoyer le lien. Réessayez ou consultez le terminal (mode dev).");
    } else {
      window.location.href = "/connexion/verifier";
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <Link href="/" className="mb-8">
        <Image src="/brand/logo-vert.png" alt="Zéro-Palabre" width={160} height={40} />
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Recevez un lien magique par email — sans mot de passe.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            {error && <p className="text-sm text-error-600">{error}</p>}
            <Button type="submit" className="w-full" loading={loading}>
              <Mail className="h-4 w-4" strokeWidth={1.5} />
              Envoyer le lien
            </Button>
            <p className="text-center text-sm text-neutral-600">
              Pas de compte ?{" "}
              <Link href="/inscription" className="font-medium text-primary-800">
                S&apos;inscrire
              </Link>
            </p>
        </form>
      </Card>
    </div>
  );
}

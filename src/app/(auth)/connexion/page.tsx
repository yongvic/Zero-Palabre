"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, LogIn, ChevronLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConnexionPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/accords");
    }
  }

  return (
    <div className="relative flex min-h-[100dvh]">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:flex-none lg:w-[500px] xl:w-[600px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-sm space-y-10 glass-card rounded-3xl p-8 md:p-10"
        >
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-primary-700 transition-colors group">
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Retour à l&apos;accueil
            </Link>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-neutral-950">
                Bon retour.
              </h1>
              <p className="text-base text-neutral-500 font-medium">
                Connectez-vous pour gérer vos accords en cours.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-neutral-500">Email professionnel</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="vous@exemple.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  className="h-12 rounded-xl border-neutral-200 focus:ring-primary-600"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-neutral-500">Mot de passe</Label>
                  <Link href="#" className="text-xs font-bold text-primary-700 hover:underline">Oublié ?</Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                    className="h-12 rounded-xl pr-12 border-neutral-200 focus:ring-primary-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-bold text-error-600"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" size="lg" className="w-full h-14 rounded-2xl text-base shadow-xl shadow-primary-700/10" loading={loading}>
              <LogIn className="h-5 w-5 mr-2" />
              Se connecter
            </Button>
          </form>

          <p className="text-center text-sm font-medium text-neutral-500">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-bold text-primary-700 hover:underline">
              S&apos;inscrire gratuitement
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Section: Visual */}
      <div className="relative hidden flex-1 overflow-hidden bg-primary-50 lg:block">
        <div className="absolute inset-0 african-pattern-mask opacity-[0.06] pointer-events-none" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-[360px] w-[360px] -translate-x-1/2 glow-primary opacity-60" />

        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 p-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card w-full max-w-md space-y-6 rounded-3xl p-10 text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <Shield className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight text-neutral-950">Sécurité maximale</h3>
              <p className="leading-relaxed text-neutral-600">
                Chaque accord est horodaté et vérifiable. Votre confiance est notre priorité.
              </p>
            </div>
          </motion.div>

          <div className="space-y-3">
            <Image src="/brand/logo-vert.png" alt="Zéro-Palabre" width={140} height={32} className="mx-auto" />
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-800">
              La preuve simple des accords du quotidien
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


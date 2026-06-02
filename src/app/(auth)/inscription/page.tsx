"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, UserPlus, ChevronLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptCgu: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.acceptCgu) {
      setError("Vous devez accepter les CGU.");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const registerRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!registerRes.ok) {
      const data = await registerRes.json().catch(() => ({}));
      setLoading(false);
      if (data?.error?.code === "EMAIL_EXISTS") {
        setError("Cet email est déjà utilisé. Connectez-vous.");
      } else {
        setError("Erreur lors de la création du compte. Vérifiez vos informations.");
      }
      return;
    }

    // Connexion automatique après inscription
    const loginRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (loginRes?.error) {
      setError("Compte créé, mais connexion automatique impossible. Connectez-vous.");
      router.push("/connexion");
    } else {
      router.push("/accords/nouveau");
    }
  }

  return (
    <div className="flex min-h-[100dvh] bg-neutral-0">
      {/* Left Section: Visual */}
      <div className="relative hidden flex-1 overflow-hidden bg-primary-50 lg:block">
        <div className="absolute inset-0 african-pattern-mask opacity-[0.06] pointer-events-none" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-[360px] w-[360px] -translate-x-1/2 glow-primary opacity-60" />

        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-12 p-16 text-center">
           <div className="space-y-6">
             <Image src="/brand/logo-vert.png" alt="Zéro-Palabre" width={160} height={36} className="mx-auto" />
             <h2 className="text-4xl font-black tracking-tighter text-neutral-950">
               Rejoignez la confiance <br /> numérique.
             </h2>
           </div>

           <div className="grid max-w-sm gap-6 text-left">
             {[
               "Créez des preuves inaltérables",
               "Construisez votre réputation",
               "Accès gratuit à vie (3 accords/mois)",
             ].map((benefit, i) => (
               <motion.div 
                 key={benefit} 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.4 + i * 0.1 }}
                 className="flex items-center gap-4 font-medium text-neutral-700"
               >
                 <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                   <CheckCircle2 className="h-4 w-4" />
                 </div>
                 <span>{benefit}</span>
               </motion.div>
             ))}
           </div>
        </div>
      </div>

      {/* Right Section: Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:flex-none lg:w-[500px] xl:w-[650px] overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-md space-y-8"
        >
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-primary-700 transition-colors group">
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Retour à l&apos;accueil
            </Link>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-neutral-950">
                Créer un compte.
              </h1>
              <p className="text-base text-neutral-500 font-medium">
                Commencez à sécuriser vos accords en moins de 2 minutes.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-neutral-500">Nom complet</Label>
                <Input
                  id="name"
                  required
                  placeholder="Jean Dupont"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-neutral-500">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+228 -- -- -- --"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-neutral-500">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="vous@exemple.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-neutral-500">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-11 rounded-xl pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-neutral-500">Confirmation</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="h-11 rounded-xl pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="acceptCgu"
                checked={form.acceptCgu}
                onChange={(e) => setForm({ ...form, acceptCgu: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-700 focus:ring-primary-600"
              />
              <Label htmlFor="acceptCgu" className="text-sm text-neutral-500 font-medium leading-tight">
                J&apos;accepte les <Link href="/cgu" className="text-primary-700 font-bold hover:underline">CGU</Link> et la <Link href="/confidentialite" className="text-primary-700 font-bold hover:underline">politique de confidentialité</Link>.
              </Label>
            </div>

            {error && <p className="text-sm font-bold text-error-600">{error}</p>}

            <Button type="submit" size="lg" className="w-full h-14 rounded-2xl text-base shadow-xl shadow-primary-700/10" loading={loading}>
              <UserPlus className="h-5 w-5 mr-2" />
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-sm font-medium text-neutral-500">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-bold text-primary-700 hover:underline">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}


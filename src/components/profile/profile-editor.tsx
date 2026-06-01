"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import {
  Camera,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileEditorProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    phone: string | null;
    kycStatus: string;
    subscription?: { plan: string } | null;
    reliabilityScore?: { score: number; honored: number; totalAccords: number } | null;
    accordBreakdown?: {
      signed: number;
      accepted: number;
      honored: number;
      inProgress: number;
      overdue: number;
      disputed: number;
      honorRate: number | null;
    };
  };
}

type AlertState = { type: "success" | "error"; message: string } | null;

export function ProfileEditor({ user }: ProfileEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.image);
  const [uploadState, setUploadState] = useState<"idle" | "uploading">("idle");
  const [avatarAlert, setAvatarAlert] = useState<AlertState>(null);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordAlert, setPasswordAlert] = useState<AlertState>(null);
  const [isPendingPassword, startPasswordTransition] = useTransition();

  /* ─────────── Avatar Upload ─────────── */
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optimistic preview
    const localPreview = URL.createObjectURL(file);
    setAvatarUrl(localPreview);
    setUploadState("uploading");
    setAvatarAlert(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        setAvatarUrl(user.image);
        setAvatarAlert({ type: "error", message: json.error ?? "Erreur d'upload" });
      } else {
        setAvatarUrl(json.data.imageUrl);
        setAvatarAlert({ type: "success", message: "Photo de profil mise à jour !" });
      }
    } catch {
      setAvatarUrl(user.image);
      setAvatarAlert({ type: "error", message: "Impossible de télécharger la photo." });
    } finally {
      setUploadState("idle");
      e.target.value = "";
    }
  };

  /* ─────────── Password Change ─────────── */
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordAlert({ type: "error", message: "Les mots de passe ne correspondent pas" });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordAlert({ type: "error", message: "Le nouveau mot de passe doit contenir au moins 8 caractères" });
      return;
    }

    startPasswordTransition(async () => {
      setPasswordAlert(null);
      try {
        const res = await fetch("/api/profile/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(passwordForm),
        });
        const json = await res.json();
        if (!res.ok) {
          setPasswordAlert({ type: "error", message: json.error ?? "Erreur serveur" });
        } else {
          setPasswordAlert({ type: "success", message: "Mot de passe modifié avec succès !" });
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }
      } catch {
        setPasswordAlert({ type: "error", message: "Erreur réseau. Réessayez." });
      }
    });
  };

  /* ─────────── Helpers ─────────── */
  const initials = (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const plan = user.subscription?.plan ?? "FREE";
  const score = user.reliabilityScore?.score ?? 50;
  const honored = user.reliabilityScore?.honored ?? 0;
  const total = user.reliabilityScore?.totalAccords ?? 0;
  const breakdown = user.accordBreakdown;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Mon profil</h1>
        <p className="mt-1 text-sm text-neutral-500">Gérez vos informations personnelles et la sécurité de votre compte.</p>
      </div>

      {/* ── Section Avatar ── */}
      <div className="rounded-2xl border border-neutral-150 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-neutral-500">Photo de profil</h2>

        <div className="flex items-center gap-6">
          {/* Avatar */}
          <button
            type="button"
            onClick={handleAvatarClick}
            className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-neutral-200 bg-neutral-100 shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            aria-label="Changer la photo de profil"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Photo de profil" fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-bold text-neutral-400">
                {initials}
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/50 opacity-0 transition-opacity group-hover:opacity-100">
              {uploadState === "uploading" ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Sélectionner une photo de profil"
          />

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploadState === "uploading"}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              {uploadState === "uploading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {uploadState === "uploading" ? "Envoi en cours…" : "Changer la photo"}
            </button>
            <p className="text-[11px] text-neutral-400">JPG, PNG, WebP ou GIF · Max 5 Mo</p>
          </div>
        </div>

        {avatarAlert && <AlertBanner alert={avatarAlert} className="mt-4" />}
      </div>

      {/* ── Section Infos ── */}
      <div className="rounded-2xl border border-neutral-150 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-neutral-500">Informations du compte</h2>
        <dl className="divide-y divide-neutral-100">
          <InfoRow label="Nom" value={user.name ?? "—"} icon={User} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Téléphone" value={user.phone ?? "—"} />
          <InfoRow label="KYC" value={user.kycStatus} />
          <InfoRow label="Abonnement" value={plan} highlight />
        </dl>
      </div>

      {/* ── Score de Fiabilité ── */}
      <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/60 to-white p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700">Score de fiabilité</h2>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-bold text-primary-800">
              {score}
              <span className="text-xl font-medium text-primary-400">/100</span>
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {honored} honorés · {total} événements comptabilisés
            </p>
          </div>
          <div className="h-2 w-40 shrink-0 overflow-hidden rounded-full bg-primary-100">
            <div className="h-full bg-primary-600 transition-all" style={{ width: `${score}%` }} />
          </div>
        </div>
        {breakdown && (
          <dl className="grid grid-cols-2 gap-3 text-sm border-t border-primary-100/80 pt-4">
            <div>
              <dt className="text-neutral-500 text-xs">Accords signés</dt>
              <dd className="font-bold text-neutral-900">{breakdown.signed}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 text-xs">Honorés</dt>
              <dd className="font-bold text-primary-800">{breakdown.honored}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 text-xs">En cours</dt>
              <dd className="font-bold text-neutral-900">{breakdown.inProgress}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 text-xs">En retard</dt>
              <dd className="font-bold text-amber-800">{breakdown.overdue}</dd>
            </div>
            <div>
              <dt className="text-neutral-500 text-xs">Litiges</dt>
              <dd className="font-bold text-neutral-900">{breakdown.disputed}</dd>
            </div>
            {breakdown.honorRate != null && (
              <div>
                <dt className="text-neutral-500 text-xs">Taux honorés</dt>
                <dd className="font-bold text-primary-800">{breakdown.honorRate} %</dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* ── Sécurité / Mot de passe ── */}
      <div className="rounded-2xl border border-neutral-150 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-neutral-500">Sécurité</h2>
        <p className="mb-5 text-xs text-neutral-400">Choisissez un mot de passe robuste d&apos;au moins 8 caractères.</p>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <PasswordField
            id="currentPassword"
            label="Mot de passe actuel"
            value={passwordForm.currentPassword}
            show={showPasswords.current}
            onToggle={() => setShowPasswords((s) => ({ ...s, current: !s.current }))}
            onChange={(v) => setPasswordForm((f) => ({ ...f, currentPassword: v }))}
          />
          <PasswordField
            id="newPassword"
            label="Nouveau mot de passe"
            value={passwordForm.newPassword}
            show={showPasswords.new}
            onToggle={() => setShowPasswords((s) => ({ ...s, new: !s.new }))}
            onChange={(v) => setPasswordForm((f) => ({ ...f, newPassword: v }))}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirmer le nouveau mot de passe"
            value={passwordForm.confirmPassword}
            show={showPasswords.confirm}
            onToggle={() => setShowPasswords((s) => ({ ...s, confirm: !s.confirm }))}
            onChange={(v) => setPasswordForm((f) => ({ ...f, confirmPassword: v }))}
          />

          {passwordAlert && <AlertBanner alert={passwordAlert} />}

          <button
            type="submit"
            disabled={
              isPendingPassword ||
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPendingPassword ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {isPendingPassword ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Sous-composants ── */

function InfoRow({
  label,
  value,
  highlight,
  icon: Icon,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="flex items-center gap-2 text-sm text-neutral-500">
        {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} />}
        {label}
      </dt>
      <dd className={cn("text-sm font-medium", highlight ? "text-primary-700" : "text-neutral-800")}>
        {value}
      </dd>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  show,
  onToggle,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-neutral-600">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 pr-11 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
          aria-label={show ? "Masquer" : "Afficher"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function AlertBanner({ alert, className }: { alert: { type: "success" | "error"; message: string }; className?: string }) {
  const isSuccess = alert.type === "success";
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium",
        isSuccess
          ? "border-primary-200 bg-primary-50 text-primary-800"
          : "border-red-200 bg-red-50 text-red-700",
        className
      )}
    >
      {isSuccess ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      {alert.message}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FileText,
  LogOut,
  Menu,
  User,
  X,
  Plus,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { AmbientBackground } from "@/components/layout/ambient-background";

const nav = [
  { href: "/accords", label: "Mes accords", icon: FileText },
  { href: "/profil", label: "Profil", icon: User },
  { href: "/abonnement", label: "Abonnement", icon: CreditCard },
];

export function DashboardShell({
  children,
  userName,
  userImage,
}: {
  children: React.ReactNode;
  userName?: string | null;
  userImage?: string | null;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = (userName ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative flex min-h-[100dvh] font-sans">
      <AmbientBackground />

      <aside className="glass-sidebar hidden w-64 flex-col lg:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/accords" className="transition-opacity hover:opacity-80">
            <Image
              src="/brand/logo-blanc.png"
              alt="Zéro-Palabre"
              width={110}
              height={28}
              priority
              className="h-7 w-auto"
            />
          </Link>
        </div>

        <div className="px-4 py-4">
          <Button asChild className="w-full justify-start gap-2" size="sm">
            <Link href="/accords/nouveau">
              <Plus className="h-4 w-4" />
              Nouvel accord
            </Link>
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-[background-color,color] duration-[220ms] ease-out",
                  active
                    ? "bg-white/10 text-primary-300"
                    : "text-neutral-400 hover:bg-white/6 hover:text-neutral-100"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4.5 w-4.5 transition-colors",
                    active ? "text-primary-400" : "text-neutral-500 group-hover:text-neutral-300"
                  )}
                  strokeWidth={active ? 2 : 1.5}
                />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-primary-400"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/8 p-4">
          <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/6">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5">
              {userImage ? (
                <Image src={userImage} alt={userName ?? "profil"} fill className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-bold text-primary-300">
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-neutral-100">{userName}</p>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[11px] font-medium text-neutral-500 transition-colors hover:text-red-400"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="glass-sidebar fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/8 px-6">
                <Image src="/brand/logo-blanc.png" alt="Zéro-Palabre" width={100} height={24} />
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-full p-2 text-neutral-400 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-4 py-6">
                <Button asChild className="w-full justify-start gap-3" onClick={() => setSidebarOpen(false)}>
                  <Link href="/accords/nouveau">
                    <Plus className="h-5 w-5" />
                    Nouvel accord
                  </Link>
                </Button>
              </div>
              <nav className="space-y-1.5 px-3">
                {nav.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                        active
                          ? "bg-white/10 text-primary-300"
                          : "text-neutral-400 active:bg-white/6"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 border-t border-white/8 p-6">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-3 text-neutral-400"
                >
                  <LogOut className="h-5 w-5" />
                  Déconnexion
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <OfflineBanner />
        <header className="glass-nav flex h-16 items-center justify-between px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-full p-2 text-neutral-300 active:bg-white/10"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-sm font-bold tracking-tight text-neutral-100">Tableau de bord</span>
          <Link
            href="/profil"
            className="relative h-8 w-8 overflow-hidden rounded-full border border-white/15"
          >
            {userImage ? (
              <Image src={userImage} alt={userName ?? "profil"} fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-primary-900/50 text-[10px] font-bold text-primary-300">
                {initials}
              </span>
            )}
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:py-10">{children}</div>
        </main>
      </div>

      <nav className="glass-nav fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around px-2 lg:hidden">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-bold transition-colors duration-[220ms]",
                active ? "text-primary-400" : "text-neutral-500"
              )}
            >
              <item.icon
                className="h-5 w-5"
                strokeWidth={active ? 2.5 : 2}
              />
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
      <div className="h-16 lg:hidden" />
    </div>
  );
}

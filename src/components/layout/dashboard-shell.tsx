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
    <div className="flex min-h-[100dvh] bg-neutral-50 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-neutral-200 bg-neutral-0 lg:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/accords" className="transition-opacity hover:opacity-80">
            <Image src="/brand/logo-vert.png" alt="Zéro-Palabre" width={48} height={28} priority />
          </Link>
        </div>

        <div className="px-4 py-4">
          <Button asChild className="w-full justify-start gap-2 shadow-sm" size="sm">
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
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-all duration-200",
                  active
                    ? "bg-primary-50 text-primary-800"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4.5 w-4.5 transition-colors",
                    active ? "text-primary-700" : "text-neutral-400 group-hover:text-neutral-600"
                  )}
                  strokeWidth={active ? 2 : 1.5}
                />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-primary-600"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-neutral-100 p-4">
          <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-neutral-50">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
              {userImage ? (
                <Image src={userImage} alt={userName ?? "profil"} fill className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-bold text-primary-800">
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-neutral-900">{userName}</p>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[11px] font-medium text-neutral-400 hover:text-error-600 transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-neutral-0 shadow-2xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-100">
                <Image src="/brand/logo-vert.png" alt="Zéro-Palabre" width={48} height={28} />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100"
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
                        "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all",
                        active
                          ? "bg-primary-50 text-primary-800"
                          : "text-neutral-500 active:bg-neutral-100"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", active ? "text-primary-700" : "text-neutral-400")} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-100 p-6">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-3 text-neutral-500"
                >
                  <LogOut className="h-5 w-5" />
                  Déconnexion
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <OfflineBanner />
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-neutral-0/80 px-4 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-full p-2 text-neutral-600 active:bg-neutral-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-sm font-bold tracking-tight text-neutral-900">Tableau de bord</span>
          <Link href="/profil" className="relative h-8 w-8 overflow-hidden rounded-full border border-neutral-200">
            {userImage ? (
              <Image src={userImage} alt={userName ?? "profil"} fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-primary-800 bg-primary-50">
                {initials}
              </span>
            )}
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Optional but often useful for quick actions) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-neutral-200 bg-neutral-0/90 px-2 backdrop-blur-lg lg:hidden">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-bold transition-colors",
                active ? "text-primary-700" : "text-neutral-400"
              )}
            >
              <item.icon className={cn("h-5 w-5", active ? "text-primary-700" : "text-neutral-400")} strokeWidth={active ? 2.5 : 2} />
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
        <button
           onClick={() => setSidebarOpen(true)}
           className="flex flex-col items-center gap-1 text-[10px] font-bold text-neutral-400"
        >
          <Menu className="h-5 w-5" />
          Plus
        </button>
      </nav>
      {/* Bottom spacer for mobile nav */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}


"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FileText,
  Home,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/accords", label: "Mes accords", icon: FileText },
  { href: "/profil", label: "Profil", icon: User },
  { href: "/abonnement", label: "Abonnement", icon: CreditCard },
];

export function DashboardShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 transform border-r border-neutral-800 bg-neutral-900 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b border-neutral-800 px-4 lg:h-16">
          <Link href="/accords">
            <Image src="/brand/logo-blanc.png" alt="Zéro-Palabre" width={120} height={28} />
          </Link>
          <button
            type="button"
            className="ml-auto text-neutral-400 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer"
          >
            <X strokeWidth={1.5} />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-800 text-neutral-0"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-0"
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-800 p-3">
          <p className="truncate px-3 text-xs text-neutral-500">{userName}</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-0"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.5} />
            Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-neutral-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-neutral-150 bg-neutral-0 px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menu"
            className="text-neutral-700"
          >
            <Menu strokeWidth={1.5} />
          </button>
          <span className="text-sm font-semibold">Tableau de bord</span>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 flex h-16 items-center justify-around border-t border-neutral-150 bg-neutral-0 lg:hidden">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 text-[11px] font-medium",
                  active ? "text-primary-800" : "text-neutral-500"
                )}
              >
                <item.icon className="h-6 w-6" strokeWidth={1.5} />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
          <Link href="/" className="flex flex-col items-center gap-0.5 text-[11px] text-neutral-500">
            <Home className="h-6 w-6" strokeWidth={1.5} />
            Accueil
          </Link>
        </nav>
        <div className="h-16 lg:hidden" />
      </div>
    </div>
  );
}

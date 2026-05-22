"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

interface SiteHeaderProps {
  dark?: boolean;
}

export function SiteHeader({ dark = false }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-md",
        dark
          ? "border-neutral-800/60 bg-neutral-950/80"
          : "border-neutral-150 bg-neutral-0/90"
      )}
    >
      <div className="mx-auto flex h-14 max-w-container items-center justify-between px-4 md:h-16 md:px-10 lg:px-20">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/logo-vert.png"
            alt="Zéro-Palabre"
            width={140}
            height={36}
            className="h-8 w-auto md:h-9"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                dark
                  ? "text-neutral-300 hover:text-neutral-0"
                  : "text-neutral-600 hover:text-primary-800"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild className={dark ? "text-neutral-300" : ""}>
            <Link href="/connexion">Connexion</Link>
          </Button>
          <Button asChild>
            <Link href="/inscription">Créer un accord</Link>
          </Button>
        </div>

        <button
          type="button"
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-md md:hidden",
            dark ? "text-neutral-0" : "text-neutral-900"
          )}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <div
          className={cn(
            "border-t px-4 py-4 md:hidden",
            dark ? "border-neutral-800 bg-neutral-950" : "border-neutral-150 bg-neutral-0"
          )}
        >
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "py-2 text-sm font-medium",
                  dark ? "text-neutral-200" : "text-neutral-700"
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/connexion" className="py-2 text-sm font-medium text-primary-600">
              Connexion
            </Link>
            <Button asChild className="w-full">
              <Link href="/inscription">Créer un accord</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

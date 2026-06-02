"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#comment-ca-marche", label: "Méthode" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

interface SiteHeaderProps {
  dark?: boolean;
}

export function SiteHeader({ dark = false }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? dark
            ? "glass-nav py-3"
            : "glass-nav py-3"
          : "border-transparent bg-transparent py-5"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src={dark ? "/brand/logo-blanc.png" : "/brand/logo-vert.png"}
            alt="Zéro-Palabre"
            width={120}
            height={32}
            className="h-8 w-auto transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[13px] font-bold uppercase tracking-widest transition-all hover:scale-105",
                dark
                  ? "text-neutral-400 hover:text-neutral-0"
                  : "text-neutral-500 hover:text-primary-800"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Button variant="ghost" asChild className={cn("rounded-xl font-bold", dark ? "text-neutral-300 hover:text-neutral-0 hover:bg-white/5" : "text-neutral-600")}>
            <Link href="/connexion">Connexion</Link>
          </Button>
          <Button asChild className="rounded-xl font-bold px-6 shadow-lg shadow-primary-700/10">
            <Link href="/inscription">
              Démarrer gratuitement
            </Link>
          </Button>
        </div>

        <button
          type="button"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl lg:hidden transition-colors",
            dark ? "text-neutral-0 hover:bg-white/10" : "text-neutral-900 hover:bg-neutral-100"
          )}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fermer" : "Menu"}
        >
          {open ? <X strokeWidth={2.5} /> : <Menu strokeWidth={2.5} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "overflow-hidden lg:hidden border-t",
              dark ? "bg-neutral-950 border-neutral-800" : "bg-neutral-0 border-neutral-100 shadow-xl"
            )}
          >
            <nav className="flex flex-col gap-2 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-4 text-base font-bold transition-all active:scale-95",
                    dark ? "text-neutral-200 active:bg-white/5" : "text-neutral-700 active:bg-neutral-50"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4 opacity-30" />
                </Link>
              ))}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Button variant="ghost" asChild className={cn("rounded-xl h-12 font-bold", dark ? "text-neutral-300 bg-white/5" : "bg-neutral-50")}>
                  <Link href="/connexion">Connexion</Link>
                </Button>
                <Button asChild className="rounded-xl h-12 font-bold">
                  <Link href="/inscription">S&apos;inscrire</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


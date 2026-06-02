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

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass-nav py-3" : "bg-transparent py-5"
      )}
    >
      <div className="page-container flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/brand/logo-vert.png"
            alt="Zéro-Palabre"
            width={120}
            height={32}
            className="h-8 w-auto transition-transform group-hover:scale-[1.02]"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-primary-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" asChild className="rounded-xl">
            <Link href="/connexion">Connexion</Link>
          </Button>
          <Button asChild className="rounded-xl shadow-md">
            <Link href="/inscription">Démarrer gratuitement</Link>
          </Button>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-neutral-800 hover:bg-neutral-100 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <X strokeWidth={2} /> : <Menu strokeWidth={2} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-neutral-200 bg-neutral-0 shadow-lg lg:hidden"
          >
            <nav className="page-container flex flex-col gap-1 py-4" aria-label="Menu mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex min-h-[44px] items-center justify-between rounded-xl px-4 text-base font-medium text-neutral-800 active:bg-neutral-50"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4 text-neutral-300" />
                </Link>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Button variant="secondary" asChild className="h-12 rounded-xl">
                  <Link href="/connexion">Connexion</Link>
                </Button>
                <Button asChild className="h-12 rounded-xl">
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

"use client";

import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function EmptyAccords() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-neutral-200 rounded-[2.5rem] bg-neutral-50/50"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary-200 blur-2xl opacity-20 rounded-full" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-neutral-0 shadow-premium border border-neutral-100">
          <FilePlus2 className="h-10 w-10 text-primary-700" strokeWidth={1.5} />
        </div>
      </div>
      
      <div className="space-y-3 max-w-sm px-4">
        <h3 className="text-2xl font-black tracking-tighter text-neutral-950">Aucun accord scellé.</h3>
        <p className="text-base text-neutral-500 font-medium leading-relaxed">
          Prêts, locations ou prestations — sécurisez vos premiers engagements dès maintenant.
        </p>
      </div>

      <Button asChild size="lg" className="mt-10 rounded-2xl h-14 px-8 shadow-xl shadow-primary-700/10 transition-all hover:scale-105 active:scale-95">
        <Link href="/accords/nouveau">
          Créer mon premier accord
        </Link>
      </Button>
    </motion.div>
  );
}


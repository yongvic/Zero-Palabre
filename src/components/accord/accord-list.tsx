"use client";

import { motion } from "framer-motion";
import { AccordCard } from "./accord-card";
import type { Accord } from "@/types/database";

interface AccordListProps {
  accords: (Accord & { initiateur?: { name: string | null } })[];
  userId: string;
}

export function AccordList({ accords, userId }: AccordListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {accords.map((accord) => (
        <motion.div
          key={accord.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <AccordCard accord={accord} currentUserId={userId} />
        </motion.div>
      ))}
    </motion.div>
  );
}

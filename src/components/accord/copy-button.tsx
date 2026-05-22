"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-3 w-full text-center text-xs font-bold text-primary-700 hover:text-primary-900 transition-colors"
    >
      {copied ? "Lien copié !" : label}
    </button>
  );
}

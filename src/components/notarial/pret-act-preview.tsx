"use client";

import { NOTARIAL_ACT_HTML_STYLES } from "@/lib/notarial/templates/pret-act-html-styles";

type Props = {
  html: string;
  className?: string;
};

/** Aperçu HTML de l'acte notarial (formules « Je soussigné… »). */
export function PretActHtmlPreview({ html, className }: Props) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NOTARIAL_ACT_HTML_STYLES }} />
      <div
        className={className ?? "notarial-act-wrap"}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}

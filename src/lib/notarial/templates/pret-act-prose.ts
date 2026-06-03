import type { NotarialFilledFields } from "@/lib/notarial/build-fields";

type Party = NotarialFilledFields["initiateur"];

function civilName(p: Party): string {
  const given = p.nom !== "—" ? p.nom : "";
  const family = p.familyName !== "—" ? p.familyName : "";
  const full = [given, family].filter(Boolean).join(" ");
  return full || "—";
}

function partyLine(p: Party, roleTitle: string): string {
  const name = civilName(p);
  return (
    `${name}, né(e) le ${p.dateNaissance}, demeurant ${p.adresse}, ` +
    `joignable au ${p.phone}, identifiant ${p.username}, ` +
    `ci-après dénommé(e) « ${roleTitle} »`
  );
}

function signatureLine(p: Party, roleTitle: string): string {
  if (p.signature === "—") {
    return `${roleTitle} : en attente de signature`;
  }
  return (
    `${roleTitle} : ${p.signature}, signé électroniquement le ${p.signedAt}`
  );
}

/** Corps de l'acte — formules type acte notarial (prêt d'argent, droit civil). */
export function buildPretActParagraphs(fields: NotarialFilledFields): string[] {
  const preteur = fields.initiateur;
  const emprunteur = fields.contrepartie;
  const preteurName = civilName(preteur);
  const emprunteurName = civilName(emprunteur);

  return [
    `ACTE DE PRÊT D'ARGENT`,
    `Référence ${fields.reference} · ${fields.templateVersion}`,
    ``,
    `Les soussignés ont comparu et, de leur gré, établi le présent acte aux termes suivants.`,
    ``,
    `COMPARUTION`,
    `1°) ${partyLine(preteur, "LE PRÊTEUR")}.`,
    `2°) ${partyLine(emprunteur, "L'EMPRUNTEUR")}.`,
    ``,
    `EXPOSÉ`,
    `Je soussigné, ${preteurName}, agissant en qualité de PRÊTEUR, déclare avoir consenti à ${emprunteurName}, EMPRUNTEUR, un prêt de deniers d'un montant de ${fields.montantLettres} (${fields.montantChiffres}), sans intérêt conventionnel, aux fins suivantes : ${fields.titre}.`,
    `${fields.description}`,
    ``,
    `Je soussigné, ${emprunteurName}, agissant en qualité d'EMPRUNTEUR, reconnais avoir reçu ledit prêt et m'engage à en restituer le capital intégral au PRÊTEUR, au plus tard le ${fields.dateEcheance}, par les voies de paiement prévues sur la plateforme Zéro-Palabre.`,
    ``,
    `ARTICLE 1 — OBJET ET MONTANT`,
    `Le PRÊTEUR déclare avoir prêté à l'EMPRUNTEUR la somme de ${fields.montantLettres}, soit ${fields.montantChiffres}, pour l'objet désigné ci-dessus.`,
    ``,
    `ARTICLE 2 — ÉCHÉANCE`,
    `Le remboursement intégral du capital est exigible au plus tard le ${fields.dateEcheance}.`,
    ``,
    `ARTICLE 3 — ENGAGEMENTS`,
    `L'EMPRUNTEUR s'oblige à restituer la somme empruntée dans les conditions convenues entre les parties et matérialisées sur la plateforme.`,
    `Le PRÊTEUR reconnaît le caractère librement consenti du présent prêt et en accepte les termes.`,
    `Les parties conviennent que le présent acte, scellé sur template validé par le notaire partenaire, vaut titre exécutoire en cas de litige devant les juridictions compétentes de la République Togolaise.`,
    ``,
    `ARTICLE 4 — SIGNATURES`,
    signatureLine(preteur, "Le PRÊTEUR"),
    signatureLine(emprunteur, "L'EMPRUNTEUR"),
    ``,
    `Fait sur la plateforme Zéro-Palabre, en date du ${fields.generatedAt ? new Date(fields.generatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}.`,
  ];
}

export function buildPretActHtml(fields: NotarialFilledFields): string {
  const paragraphs = buildPretActParagraphs(fields);
  const body = paragraphs
    .map((p) => {
      if (p === "") return `<p class="act-spacer" aria-hidden="true">&nbsp;</p>`;
      if (p.startsWith("ACTE DE"))
        return `<h1 class="act-title">${escapeHtml(p)}</h1>`;
      if (p.startsWith("Référence"))
        return `<p class="act-ref">${escapeHtml(p)}</p>`;
      if (p === "COMPARUTION" || p.startsWith("ARTICLE") || p === "EXPOSÉ" || p === "ARTICLE 4 — SIGNATURES")
        return `<h2 class="act-heading">${escapeHtml(p)}</h2>`;
      if (/^\d+°\)/.test(p))
        return `<p class="act-party">${escapeHtml(p)}</p>`;
      if (p.startsWith("Je soussigné"))
        return `<p class="act-declaration">${escapeHtml(p)}</p>`;
      if (p.startsWith("Le PRÊTEUR") || p.startsWith("L'EMPRUNTEUR"))
        return `<p class="act-signature">${escapeHtml(p)}</p>`;
      if (p.startsWith("Fait sur"))
        return `<p class="act-closing">${escapeHtml(p)}</p>`;
      return `<p class="act-body">${escapeHtml(p)}</p>`;
    })
    .join("\n");

  return `<article class="notarial-act" lang="fr">${body}</article>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

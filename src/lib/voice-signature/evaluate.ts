import type { VoiceAccordContext, VoiceExtraction, VoiceMissingField } from "./types";
import { namesMatch } from "./match";

export function evaluateVoiceExtraction(
  extraction: VoiceExtraction,
  context: VoiceAccordContext,
  intent: "accept" | "reject"
): { missingFields: VoiceMissingField[]; ready: boolean } {
  const missing: VoiceMissingField[] = [];

  if (extraction.intent === "unclear" || extraction.intent !== intent) {
    missing.push({
      key: "intent",
      label: "Position claire",
      question:
        intent === "accept"
          ? "Dites clairement que vous acceptez cet accord (ex. : « J'accepte cet accord »)."
          : "Dites clairement que vous refusez cet accord et pourquoi.",
    });
  }

  if (!extraction.explicitConsent) {
    missing.push({
      key: "explicitConsent",
      label: "Consentement explicite",
      question:
        intent === "accept"
          ? "Formulez votre accord explicite, par exemple : « Je confirme accepter cet accord. »"
          : "Confirmez votre refus, par exemple : « Je refuse cet accord. »",
    });
  }

  if (!namesMatch(extraction.signerName, context.destinataireNom)) {
    missing.push({
      key: "signerName",
      label: "Votre nom complet",
      question: `Indiquez votre nom complet tel qu'il figure sur l'invitation : ${context.destinataireNom}.`,
    });
  }

  if (intent === "accept" && !extraction.acknowledgedTerms) {
    missing.push({
      key: "acknowledgedTerms",
      label: "Reconnaissance de l'accord",
      question: `Mentionnez le titre ou la référence de l'accord (ex. : « J'accepte l'accord ${context.titre} », réf. ${context.reference}).`,
    });
  }

  if (intent === "reject") {
    const hasComment =
      Boolean(extraction.commentaire?.trim()) &&
      extraction.commentaire!.trim().length >= 8;
    if (!hasComment) {
      missing.push({
        key: "commentaire",
        label: "Motif du refus",
        question: "Expliquez brièvement pourquoi vous refusez cet accord.",
      });
    }
  }

  const aiMissing = extraction.missingFields.filter(
    (f) => !missing.some((m) => m.key === f.key)
  );

  const allMissing = [...missing, ...aiMissing];
  const unique = allMissing.filter(
    (item, index, arr) => arr.findIndex((x) => x.key === item.key) === index
  );

  return {
    missingFields: unique,
    ready: unique.length === 0,
  };
}

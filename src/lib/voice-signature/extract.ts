import { geminiChat } from "@/lib/gemini/client";
import type { VoiceAccordContext, VoiceExtraction } from "./types";
import { voiceExtractionSchema } from "./types";

function buildSystemPrompt(context: VoiceAccordContext, intent: "accept" | "reject") {
  return `Tu es l'assistant juridique de Zéro-Palabre (Togo / Afrique de l'Ouest).
Analyse la transcription vocale d'un destinataire qui ${intent === "accept" ? "accepte" : "refuse"} un accord.

Contexte de l'accord :
- Référence : ${context.reference}
- Titre : ${context.titre}
- Initiateur : ${context.initiateurName}
- Destinataire attendu : ${context.destinataireNom}
- Montant : ${context.montant ?? "non précisé"} ${context.devise}
- Description (extrait) : ${context.description.slice(0, 400)}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "intent": "accept" | "reject" | "unclear",
  "signerName": string | null,
  "explicitConsent": boolean,
  "acknowledgedTerms": boolean,
  "commentaire": string | null,
  "missingFields": [{ "key": string, "label": string, "question": string }],
  "confidence": number entre 0 et 1,
  "summaryFr": "résumé en 1-2 phrases de ce que la personne a dit"
}

Règles :
- explicitConsent = true seulement si formulation claire d'acceptation ou de refus.
- acknowledgedTerms = true si titre, référence, montant ou termes globaux sont mentionnés.
- signerName = nom complet déclaré par le locuteur.
- missingFields = champs encore ambigus (vide si tout est clair).
- Langue : français (accepter aussi expressions locales courantes).`;
}

export async function extractFromTranscript(
  transcript: string,
  context: VoiceAccordContext,
  intent: "accept" | "reject",
  priorTranscripts: string[] = []
): Promise<VoiceExtraction> {
  const history =
    priorTranscripts.length > 0
      ? `\n\nTranscriptions précédentes du même destinataire :\n${priorTranscripts.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
      : "";

  const raw = await geminiChat(
    [
      { role: "system", content: buildSystemPrompt(context, intent) },
      {
        role: "user",
        content: `Intention attendue : ${intent}\n\nNouvelle transcription :\n${transcript}${history}`,
      },
    ],
    { json: true, temperature: 0.1 }
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Réponse IA non JSON");
    parsed = JSON.parse(match[0]);
  }

  return voiceExtractionSchema.parse(parsed);
}

import { deepseekChat } from "@/lib/deepseek/client";
import { accordDraftExtractionSchema, type AccordDraftExtraction } from "./types";

export type InitiateurContext = {
  name: string;
  email: string;
};

function buildSystemPrompt(initiateur: InitiateurContext) {
  return `Tu es l'assistant de création d'accords sur Zéro-Palabre (Togo / Afrique de l'Ouest).
L'utilisateur INITIE un accord en parlant. Il est l'initiateur, PAS le destinataire.

Initiateur (ne pas confondre avec destinataire) :
- Nom : ${initiateur.name}
- Email : ${initiateur.email}

Extrais les champs pour créer un accord à partir de sa déclaration vocale.

Réponds UNIQUEMENT en JSON valide :
{
  "type": "PRET" | "PRESTATION" | "LOCATION" | "COMMANDE" | "AUTRE" | "unclear",
  "titre": string | null,
  "destinataireNom": string | null,
  "destinataireEmail": string | null,
  "montant": number | null,
  "devise": "FCFA" | "EUR" | "USD" | null,
  "dateEcheance": "YYYY-MM-DD" | null,
  "description": string | null,
  "missingFields": [{ "key": string, "label": string, "question": string }],
  "confidence": number,
  "summaryFr": "résumé en 1-2 phrases"
}

Règles :
- type selon le sens (prêt d'argent → PRET, travail → PRESTATION, etc.)
- montant en nombre sans symbole (ex. 150000 pour 150 000 FCFA)
- devise FCFA par défaut au Togo
- dateEcheance au format ISO si une échéance est mentionnée
- missingFields = infos encore absentes ou ambiguës`;
}

export async function extractAccordFromTranscript(
  transcript: string,
  initiateur: InitiateurContext,
  priorTranscripts: string[] = []
): Promise<AccordDraftExtraction> {
  const history =
    priorTranscripts.length > 0
      ? `\n\nDéclarations précédentes :\n${priorTranscripts.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
      : "";

  const raw = await deepseekChat(
    [
      { role: "system", content: buildSystemPrompt(initiateur) },
      {
        role: "user",
        content: `Transcription :\n${transcript}${history}`,
      },
    ],
    { json: true, temperature: 0.15 }
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Réponse IA non JSON");
    parsed = JSON.parse(match[0]);
  }

  return accordDraftExtractionSchema.parse(parsed);
}

const GEMINI_API_BASE =
  process.env.GEMINI_API_BASE ??
  "https://generativelanguage.googleapis.com/v1beta";

export type GeminiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GenerateContentResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string; code?: number; status?: string };
};

export class GeminiApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "GeminiApiError";
  }
}

export function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    undefined
  );
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

/** Message utilisateur lisible selon la réponse Gemini */
export function geminiUserMessage(err: GeminiApiError): string {
  if (err.status === 429 || /quota|rate/i.test(err.message)) {
    return "Quota Gemini dépassé. Patientez ou vérifiez votre plan sur Google AI Studio.";
  }
  if (
    err.status === 401 ||
    err.status === 403 ||
    /api key|permission|invalid/i.test(err.message)
  ) {
    return "Clé API Gemini invalide. Vérifiez GEMINI_API_KEY dans .env (Google AI Studio).";
  }
  if (err.status === 404 || /model/i.test(err.message)) {
    return `Modèle Gemini introuvable (${process.env.GEMINI_MODEL ?? "gemini-2.0-flash"}). Ajustez GEMINI_MODEL dans .env.`;
  }
  return `Gemini : ${err.message}`;
}

export async function geminiChat(
  messages: GeminiMessage[],
  options?: { json?: boolean; temperature?: number }
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY non configurée");
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const systemText = messages.find((m) => m.role === "system")?.content;

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  if (contents.length === 0) {
    throw new Error("Aucun message utilisateur pour Gemini");
  }

  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      ...(systemText
        ? { systemInstruction: { parts: [{ text: systemText }] } }
        : {}),
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
        ...(options?.json ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });

  const data = (await res.json()) as GenerateContentResponse;

  if (!res.ok) {
    const msg =
      data.error?.message ?? `Gemini HTTP ${res.status}`;
    throw new GeminiApiError(msg, res.status, data.error?.status);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text?.trim()) {
    throw new Error("Réponse Gemini vide");
  }

  return text;
}

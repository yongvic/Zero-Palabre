const GEMINI_API_BASE =
  process.env.GEMINI_API_BASE ??
  "https://generativelanguage.googleapis.com/v1beta";

/** Modèles avec quota gratuit plus souvent disponible en premier */
const FALLBACK_MODELS = [
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
] as const;

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

function parseRetrySeconds(message: string): number | null {
  const m = message.match(/retry in ([\d.]+)s/i);
  if (!m) return null;
  const sec = Math.ceil(parseFloat(m[1]));
  return Number.isFinite(sec) ? sec : null;
}

/** Message utilisateur lisible selon la réponse Gemini */
export function geminiUserMessage(err: GeminiApiError): string {
  const retrySec = parseRetrySeconds(err.message);

  if (err.status === 429 || /quota|rate|limit:\s*0/i.test(err.message)) {
    if (/limit:\s*0/i.test(err.message)) {
      return (
        "Ce modèle Gemini n'a pas de quota gratuit sur votre compte. " +
        "Mettez GEMINI_MODEL=gemini-1.5-flash dans .env, redémarrez le serveur, puis réessayez."
      );
    }
    if (retrySec) {
      return `Quota Gemini temporairement atteint. Réessayez dans environ ${retrySec} secondes.`;
    }
    return "Quota Gemini dépassé. Patientez une minute ou vérifiez votre quota sur aistudio.google.com.";
  }
  if (
    err.status === 401 ||
    err.status === 403 ||
    /api key|permission|invalid/i.test(err.message)
  ) {
    return "Clé API Gemini invalide. Vérifiez GEMINI_API_KEY dans .env (Google AI Studio).";
  }
  if (err.status === 404 || /model.*not found/i.test(err.message)) {
    return `Modèle Gemini introuvable. Essayez GEMINI_MODEL=gemini-1.5-flash dans .env.`;
  }
  return `Gemini : ${err.message}`;
}

function modelsToTry(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";
  const list = [preferred, ...FALLBACK_MODELS.filter((m) => m !== preferred)];
  return Array.from(new Set(list));
}

async function generateWithModel(
  model: string,
  apiKey: string,
  messages: GeminiMessage[],
  options?: { json?: boolean; temperature?: number }
): Promise<string> {
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
    const msg = data.error?.message ?? `Gemini HTTP ${res.status}`;
    throw new GeminiApiError(msg, res.status, data.error?.status);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text?.trim()) {
    throw new Error("Réponse Gemini vide");
  }

  return text;
}

export async function geminiChat(
  messages: GeminiMessage[],
  options?: { json?: boolean; temperature?: number }
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY non configurée");
  }

  const models = modelsToTry();
  let lastError: GeminiApiError | null = null;

  for (const model of models) {
    try {
      return await generateWithModel(model, apiKey, messages, options);
    } catch (e) {
      if (e instanceof GeminiApiError) {
        lastError = e;
        const retryable =
          e.status === 429 || e.status === 404 || /limit:\s*0/i.test(e.message);
        if (retryable && models.indexOf(model) < models.length - 1) {
          console.warn(`[gemini] ${model} failed (${e.status}), trying next model…`);
          continue;
        }
        throw e;
      }
      throw e;
    }
  }

  throw lastError ?? new Error("Aucun modèle Gemini disponible");
}

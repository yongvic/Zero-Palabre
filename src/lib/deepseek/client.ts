const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";

export type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string; code?: string };
};

export class DeepSeekApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "DeepSeekApiError";
  }
}

/** Message utilisateur lisible selon la réponse DeepSeek */
export function deepSeekUserMessage(err: DeepSeekApiError): string {
  if (err.status === 402 || /insufficient balance/i.test(err.message)) {
    return "Solde DeepSeek insuffisant. Rechargez votre compte sur platform.deepseek.com puis réessayez.";
  }
  if (err.status === 401 || /invalid.*api.*key/i.test(err.message)) {
    return "Clé API DeepSeek invalide. Vérifiez DEEPSEEK_API_KEY dans votre fichier .env.";
  }
  if (err.status === 429) {
    return "Trop de requêtes DeepSeek. Patientez une minute et réessayez.";
  }
  if (err.status === 400 && /model/i.test(err.message)) {
    return `Modèle DeepSeek invalide (${process.env.DEEPSEEK_MODEL ?? "deepseek-chat"}). Essayez DEEPSEEK_MODEL=deepseek-chat dans .env.`;
  }
  return `DeepSeek : ${err.message}`;
}

export function isDeepSeekConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
}

export async function deepseekChat(
  messages: DeepSeekMessage[],
  options?: { json?: boolean; temperature?: number }
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY non configurée");
  }

  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.2,
      stream: false,
      ...(options?.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  const data = (await res.json()) as ChatCompletionResponse;

  if (!res.ok) {
    const msg = data.error?.message ?? `DeepSeek HTTP ${res.status}`;
    throw new DeepSeekApiError(msg, res.status, data.error?.code);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Réponse DeepSeek vide");
  }

  return content;
}

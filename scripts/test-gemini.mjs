import "dotenv/config";

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

if (!key) {
  console.error("GEMINI_API_KEY missing");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ role: "user", parts: [{ text: 'Reply JSON only: {"ok":true}' }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  }),
});

const body = await res.text();
console.log("STATUS", res.status);
console.log("BODY", body.slice(0, 600));

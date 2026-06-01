import "dotenv/config";

const key = process.env.DEEPSEEK_API_KEY;
const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

if (!key) {
  console.error("DEEPSEEK_API_KEY missing");
  process.exit(1);
}

const res = await fetch("https://api.deepseek.com/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  },
  body: JSON.stringify({
    model,
    messages: [
      {
        role: "user",
        content: 'Reply with JSON only: {"ok":true}',
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  }),
});

const body = await res.text();
console.log("STATUS", res.status);
console.log("BODY", body.slice(0, 800));

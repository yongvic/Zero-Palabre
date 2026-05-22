import { Resend } from "resend";

type VerificationParams = {
  identifier: string;
  url: string;
  provider: { from?: string };
};

function logMagicLinkToConsole({ identifier, url }: VerificationParams) {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║  ZÉRO-PALABRE — Magic link (mode dev, pas d'email envoyé) ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║  Email : ${identifier}`);
  console.log(`║  Lien  : ${url}`);
  console.log("╚══════════════════════════════════════════════════════════╝\n");
}

export function shouldUseConsoleEmail(): boolean {
  return (
    process.env.AUTH_EMAIL_DEV === "true" ||
    process.env.AUTH_EMAIL_DEV === "1"
  );
}

export async function sendMagicLinkEmail(params: VerificationParams) {
  if (shouldUseConsoleEmail()) {
    logMagicLinkToConsole(params);
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey?.startsWith("re_")) {
    logMagicLinkToConsole(params);
    return;
  }

  const from =
    process.env.RESEND_FROM_EMAIL ??
    "Zéro-Palabre <onboarding@resend.dev>";

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.identifier,
      subject: "Connexion à Zéro-Palabre",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h1 style="color:#0F6E56;">Zéro-Palabre</h1>
          <p>Cliquez pour vous connecter (lien valide 15 minutes) :</p>
          <p><a href="${params.url}" style="display:inline-block;background:#0F6E56;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Se connecter</a></p>
          <p style="color:#757570;font-size:13px;">Si vous n'avez pas demandé ce lien, ignorez cet email.</p>
        </div>
      `,
    });

    if (error) throw new Error(error.message);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[auth] Resend indisponible, lien affiché dans la console :",
        err instanceof Error ? err.message : err
      );
      logMagicLinkToConsole(params);
      return;
    }
    throw err;
  }
}

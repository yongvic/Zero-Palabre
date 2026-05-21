import { Resend } from "resend";

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendTransactionalEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from =
    process.env.RESEND_FROM_EMAIL ?? "Zéro-Palabre <onboarding@resend.dev>";

  if (!resend) {
    console.info("[DEV EMAIL]", { to, subject, html: html.slice(0, 200) });
    return { id: "dev-mock" };
  }

  return resend.emails.send({ from, to, subject, html });
}

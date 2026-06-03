import { inviteExpiryLabel } from "@/lib/invite-expiry";

export function accordInviteEmail({
  initiateurName,
  titre,
  validationUrl,
}: {
  initiateurName: string;
  titre: string;
  validationUrl: string;
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background:#F9F9F6; padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #E5E5DF;">
    <img src="${process.env.NEXT_PUBLIC_APP_URL}/brand/logo-vert.png" alt="Zéro-Palabre" height="32" style="margin-bottom:24px"/>
    <h1 style="color:#0F6E56;font-size:22px;margin:0 0 16px;">Nouvel accord à valider</h1>
    <p style="color:#1A1A16;line-height:1.6;">${initiateurName} vous invite à valider l'accord : <strong>${titre}</strong></p>
    <p style="color:#5A5A52;font-size:14px;">Ce lien est valide ${inviteExpiryLabel()}.</p>
    <a href="${validationUrl}" style="display:inline-block;margin-top:24px;background:#0F6E56;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Consulter et valider</a>
  </div>
</body>
</html>`;
}

export function accordValidatedEmail({
  titre,
  reference,
}: {
  titre: string;
  reference: string;
}) {
  return `
<p style="font-family:sans-serif;color:#1A1A16;">L'accord <strong>${titre}</strong> (${reference}) a été validé. Téléchargez votre preuve PDF depuis votre tableau de bord.</p>`;
}

export function accordDeclaredEmail({
  debtorName,
  titre,
  reference,
  confirmUrl,
}: {
  debtorName: string;
  titre: string;
  reference: string;
  confirmUrl: string;
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;background:#F9F9F6;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #E5E5DF;">
    <h1 style="color:#0F6E56;font-size:20px;">Remboursement déclaré</h1>
    <p style="color:#1A1A16;line-height:1.6;"><strong>${debtorName}</strong> déclare avoir honoré l'accord <strong>${titre}</strong> (${reference}).</p>
    <p style="color:#5A5A52;font-size:14px;">Confirmez ou refusez cette déclaration sur la plateforme.</p>
    <a href="${confirmUrl}" style="display:inline-block;margin-top:20px;background:#0F6E56;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Vérifier la déclaration</a>
  </div>
</body>
</html>`;
}

export function accordHonoredEmail({
  titre,
  reference,
  verifyUrl,
}: {
  titre: string;
  reference: string;
  verifyUrl: string;
}) {
  return `
<p style="font-family:sans-serif;color:#1A1A16;">Votre remboursement pour <strong>${titre}</strong> (${reference}) a été confirmé. L'accord est maintenant <strong>honoré</strong>.</p>
<p><a href="${verifyUrl}" style="color:#0F6E56;">Voir la preuve publique</a></p>`;
}

export function accordFulfillmentRejectedEmail({
  titre,
  reason,
}: {
  titre: string;
  reason: string;
}) {
  return `
<p style="font-family:sans-serif;color:#1A1A16;">La déclaration de paiement pour <strong>${titre}</strong> a été refusée.</p>
<p style="color:#5A5A52;">Motif : ${reason}</p>
<p>Un litige a été ouvert sur la plateforme.</p>`;
}

export function accordOverdueEmail({
  titre,
  reference,
  executerUrl,
  dashboardUrl,
}: {
  titre: string;
  reference: string;
  executerUrl: string;
  dashboardUrl: string;
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;background:#F9F9F6;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #E5E5DF;">
    <h1 style="color:#B45309;font-size:20px;">Échéance dépassée</h1>
    <p style="color:#1A1A16;line-height:1.6;">L'accord <strong>${titre}</strong> (${reference}) a dépassé sa date d'échéance.</p>
    <p style="color:#5A5A52;font-size:14px;">Débiteur : déclarez votre remboursement si effectué.</p>
    <a href="${executerUrl}" style="display:inline-block;margin:12px 8px 0 0;background:#0F6E56;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Déclarer un remboursement</a>
    <a href="${dashboardUrl}" style="display:inline-block;margin-top:12px;color:#0F6E56;">Tableau de bord</a>
  </div>
</body>
</html>`;
}

export function accordDueReminderEmail({
  titre,
  reference,
  daysBefore,
  montant,
  dateEcheance,
  role,
  repaymentModeLabel,
  accordUrl,
}: {
  titre: string;
  reference: string;
  daysBefore: number;
  montant: string;
  dateEcheance: string;
  role: "borrower" | "lender";
  repaymentModeLabel?: string;
  accordUrl: string;
}) {
  const when =
    daysBefore === 0
      ? "aujourd'hui"
      : daysBefore === 1
        ? "demain"
        : `dans ${daysBefore} jours`;

  const roleLine =
    role === "borrower"
      ? `<p style="color:#5A5A52;font-size:14px;">${repaymentModeLabel ? `Mode : ${repaymentModeLabel}.` : "Pensez à effectuer le remboursement avant l'échéance."}</p>`
      : `<p style="color:#5A5A52;font-size:14px;">Votre contrepartie doit rembourser avant le ${dateEcheance}.</p>`;

  return `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;background:#F9F9F6;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #E5E5DF;">
    <h1 style="color:#0F6E56;font-size:20px;">Rappel — échéance ${when}</h1>
    <p style="color:#1A1A16;line-height:1.6;">Accord <strong>${titre}</strong> (${reference})</p>
    <p style="color:#1A1A16;line-height:1.6;">Montant : <strong>${montant}</strong> · Échéance : ${dateEcheance}</p>
    ${roleLine}
    <a href="${accordUrl}" style="display:inline-block;margin-top:20px;background:#0F6E56;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Voir l'accord</a>
  </div>
</body>
</html>`;
}

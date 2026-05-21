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
    <p style="color:#5A5A52;font-size:14px;">Ce lien est valide 72 heures.</p>
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

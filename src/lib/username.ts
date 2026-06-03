const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

/** Normalise @koffi_mensah → koffi_mensah */
export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

export function formatUsernameDisplay(username: string): string {
  return `@${username}`;
}

export function validateUsername(raw: string): { ok: true; username: string } | { ok: false; message: string } {
  const username = normalizeUsername(raw);
  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      message: "Identifiant invalide : 3 à 30 caractères (lettres, chiffres, _)",
    };
  }
  return { ok: true, username };
}

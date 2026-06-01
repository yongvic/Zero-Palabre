/** Correspondance tolérante entre le nom prononcé et le destinataire attendu */
export function namesMatch(spoken: string | null | undefined, expected: string): boolean {
  if (!spoken?.trim()) return false;

  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .trim();

  const a = norm(spoken);
  const b = norm(expected);

  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const aParts = a.split(/\s+/).filter(Boolean);
  const bParts = b.split(/\s+/).filter(Boolean);
  const overlap = aParts.filter((p) => bParts.some((q) => q.startsWith(p) || p.startsWith(q)));
  return overlap.length >= Math.min(2, Math.min(aParts.length, bParts.length));
}

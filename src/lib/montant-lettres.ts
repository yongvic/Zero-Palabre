/** Montant entier → lettres (français, MVP prêts FCFA). */
const UNITS = [
  "zéro",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
  "dix-sept",
  "dix-huit",
  "dix-neuf",
];

function under100(n: number): string {
  if (n < 20) return UNITS[n] ?? String(n);
  if (n < 70) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    const base = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"][ten];
    if (unit === 0) return base ?? String(n);
    if (unit === 1 && ten !== 8) return `${base}-et-${UNITS[unit]}`;
    return `${base}-${UNITS[unit]}`;
  }
  if (n < 80) return `soixante-${UNITS[n - 60]}`;
  if (n < 100) {
    const rest = n - 80;
    if (rest === 0) return "quatre-vingts";
    return `quatre-vingt-${UNITS[rest]}`;
  }
  return String(n);
}

function under1000(n: number): string {
  if (n < 100) return under100(n);
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const head = hundred === 1 ? "cent" : `${UNITS[hundred]} cent`;
  if (rest === 0) return hundred > 1 ? `${head}s` : head;
  return `${head} ${under100(rest)}`;
}

function under1_000_000(n: number): string {
  if (n < 1000) return under1000(n);
  const thousand = Math.floor(n / 1000);
  const rest = n % 1000;
  const head = thousand === 1 ? "mille" : `${under1000(thousand)} mille`;
  if (rest === 0) return head;
  return `${head} ${under1000(rest)}`;
}

export function montantEnLettres(amount: number, devise = "francs CFA"): string {
  const int = Math.floor(Math.abs(amount));
  if (int === 0) return `zéro ${devise}`;
  const words = under1_000_000(int);
  return `${words} ${devise}`;
}

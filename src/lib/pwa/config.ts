/** Constantes PWA Zéro-Palabre */
export const PWA_CONFIG = {
  name: "Zéro-Palabre",
  shortName: "Zéro-Palabre",
  description:
    "La preuve simple des accords du quotidien — accords numériques validés en moins de 2 minutes.",
  themeColor: "#0F6E56",
  backgroundColor: "#F9F9F6",
  startUrl: "/",
  scope: "/",
  swPath: "/sw.js",
  /** Routes dashboard (cache NetworkFirst — phase 2) */
  dashboardPaths: ["/accords", "/profil", "/abonnement", "/tableau-de-bord"],
} as const;

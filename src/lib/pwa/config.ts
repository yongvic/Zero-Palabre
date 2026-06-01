/** Constantes PWA Zéro-Palabre */
export const PWA_CONFIG = {
  name: "Zéro-Palabre",
  shortName: "Zéro-Palabre",
  description:
    "La preuve simple des accords du quotidien — accords numériques validés en moins de 2 minutes.",
  themeColor: "#0F6E56",
  /** Fond des icônes PWA (public/icons/icone 192×192.png) */
  backgroundColor: "#116454",
  icons: {
    icon192: "/icons/icon-192.png",
    icon512: "/icons/icon-512.png",
  },
  startUrl: "/",
  scope: "/",
  swPath: "/sw.js",
  /** Routes dashboard (cache NetworkFirst — phase 2) */
  dashboardPaths: ["/accords", "/profil", "/abonnement", "/tableau-de-bord"],
} as const;

import type { MetadataRoute } from "next";
import { PWA_CONFIG } from "@/lib/pwa/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PWA_CONFIG.name,
    short_name: PWA_CONFIG.shortName,
    description: PWA_CONFIG.description,
    start_url: PWA_CONFIG.startUrl,
    scope: PWA_CONFIG.scope,
    display: "standalone",
    orientation: "portrait-primary",
    background_color: PWA_CONFIG.backgroundColor,
    theme_color: PWA_CONFIG.themeColor,
    lang: "fr",
    dir: "ltr",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: PWA_CONFIG.icons.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_CONFIG.icons.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_CONFIG.icons.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Mes accords",
        short_name: "Accords",
        url: "/accords",
        icons: [{ src: PWA_CONFIG.icons.icon192, sizes: "192x192" }],
      },
      {
        name: "Nouvel accord",
        short_name: "Créer",
        url: "/accords/nouveau",
        icons: [{ src: PWA_CONFIG.icons.icon192, sizes: "192x192" }],
      },
    ],
  };
}

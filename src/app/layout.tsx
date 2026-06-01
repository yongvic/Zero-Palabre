import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { PWA_CONFIG } from "@/lib/pwa/config";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Zéro-Palabre — La preuve simple des accords du quotidien",
    template: "%s | Zéro-Palabre",
  },
  description:
    "Créez un accord numérique valide en moins de 2 minutes. Preuve PDF horodatée, partageable et vérifiable — adapté aux réalités du terrain africain.",
  keywords: ["accord", "contrat", "Togo", "preuve", "prêt", "prestation"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: PWA_CONFIG.shortName,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: PWA_CONFIG.themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakarta.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen font-sans">
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}


import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zéro-Palabre — La preuve simple des accords du quotidien",
    template: "%s | Zéro-Palabre",
  },
  description:
    "Créez un accord numérique valide en moins de 2 minutes. Preuve PDF horodatée, partageable et vérifiable — adapté aux réalités du terrain africain.",
  keywords: ["accord", "contrat", "Togo", "preuve", "prêt", "prestation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={plusJakarta.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}

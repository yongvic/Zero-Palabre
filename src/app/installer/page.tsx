import Image from "next/image";
import Link from "next/link";
import { Smartphone, Share, MoreVertical, PlusSquare } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = {
  android: [
    "Ouvrez zeropalabre.com dans Chrome.",
    "Appuyez sur le menu ⋮ en haut à droite.",
    "Choisissez « Installer l'application » ou « Ajouter à l'écran d'accueil ».",
    "Confirmez — l'icône Zéro-Palabre apparaît sur votre écran.",
  ],
  ios: [
    "Ouvrez le site dans Safari (obligatoire sur iPhone).",
    "Appuyez sur Partager (icône carré avec flèche).",
    "Faites défiler et choisissez « Sur l'écran d'accueil ».",
    "Appuyez sur « Ajouter » en haut à droite.",
  ],
};

export default function InstallerPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 md:px-10">
        <div className="mb-10 text-center">
          <Image
            src="/brand/logo-vert.png"
            alt="Zéro-Palabre"
            width={160}
            height={40}
            className="mx-auto mb-6"
          />
          <h1 className="text-heading-xl text-neutral-900">
            Installer l&apos;application
          </h1>
          <p className="mt-3 text-neutral-600">
            Pas de téléchargement lourd : une icône sur votre téléphone qui ouvre
            Zéro-Palabre en plein écran, comme une app native légère.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-50">
                <Smartphone className="h-5 w-5 text-primary-800" strokeWidth={1.5} />
              </div>
              <CardTitle>Android (Chrome)</CardTitle>
              <CardDescription>
                Une bannière « Installer » peut s&apos;afficher automatiquement.
              </CardDescription>
            </CardHeader>
            <ol className="list-decimal space-y-2 px-6 pb-6 text-sm text-neutral-600">
              {steps.android.map((s) => (
                <li key={s} className="ml-4">
                  {s}
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex gap-2">
                <Share className="h-5 w-5 text-primary-800" strokeWidth={1.5} />
                <PlusSquare className="h-5 w-5 text-primary-800" strokeWidth={1.5} />
              </div>
              <CardTitle>iPhone (Safari)</CardTitle>
              <CardDescription>
                Apple n&apos;affiche pas la même bannière qu&apos;Android — suivez ces étapes.
              </CardDescription>
            </CardHeader>
            <ol className="list-decimal space-y-2 px-6 pb-6 text-sm text-neutral-600">
              {steps.ios.map((s) => (
                <li key={s} className="ml-4">
                  {s}
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MoreVertical className="h-5 w-5" strokeWidth={1.5} />
              Ordinateur (Chrome / Edge)
            </CardTitle>
            <CardDescription>
              Cliquez sur l&apos;icône d&apos;installation dans la barre d&apos;adresse
              lorsque vous visitez le site.
            </CardDescription>
          </CardHeader>
        </Card>

        <p className="mt-10 text-center text-sm text-neutral-500">
          <Link href="/" className="font-medium text-primary-800 hover:underline">
            Retour à l&apos;accueil
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

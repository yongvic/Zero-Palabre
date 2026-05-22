import Image from "next/image";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ConnexionErreurPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <Link href="/" className="mb-8">
        <Image src="/brand/logo-vert.png" alt="Zéro-Palabre" width={160} height={40} />
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connexion impossible</CardTitle>
          <CardDescription>
            {searchParams.error === "Verification"
              ? "Le lien a expiré ou a déjà été utilisé."
              : "Une erreur s'est produite lors de l'envoi du lien."}
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <Button asChild className="w-full">
            <Link href="/connexion">Réessayer</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

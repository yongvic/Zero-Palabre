import Image from "next/image";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifierEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <Link href="/" className="mb-8">
        <Image src="/brand/logo-vert.png" alt="Zéro-Palabre" width={160} height={40} />
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Vérifiez votre email</CardTitle>
          <CardDescription>
            Un lien de connexion a été envoyé. Il expire dans 15 minutes.
          </CardDescription>
        </CardHeader>
        <p className="px-6 pb-6 text-center text-sm text-neutral-600">
          <Link href="/connexion" className="font-medium text-primary-800">
            Utiliser un autre email
          </Link>
        </p>
      </Card>
    </div>
  );
}

import { auth } from "@/auth";
import { CreateAccordForm } from "@/components/accord/create-accord-form";

export default async function NouvelAccordPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-heading-xl text-neutral-900">Créer un accord</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Complétez les étapes en moins de 2 minutes.
      </p>
      <div className="mt-8">
        <CreateAccordForm
          initiateurName={session!.user!.name ?? "Utilisateur"}
          initiateurEmail={session!.user!.email ?? ""}
        />
      </div>
    </div>
  );
}

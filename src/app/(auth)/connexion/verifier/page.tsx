import { redirect } from "next/navigation";

// Cette page n'est plus utilisée avec l'authentification par mot de passe.
export default function VerifierEmailPage() {
  redirect("/connexion");
}

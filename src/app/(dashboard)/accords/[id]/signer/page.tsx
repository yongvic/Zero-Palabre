import { SignAccordClient } from "@/components/accord/sign-accord-client";

export default function SignerAccordPage({ params }: { params: { id: string } }) {
  return <SignAccordClient accordId={params.id} />;
}

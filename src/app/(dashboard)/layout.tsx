import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Providers } from "@/components/providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  return (
    <Providers session={session}>
      <DashboardShell userName={session.user.name ?? session.user.email}>
        {children}
      </DashboardShell>
    </Providers>
  );
}

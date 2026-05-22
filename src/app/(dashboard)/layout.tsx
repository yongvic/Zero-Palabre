import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Providers } from "@/components/providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  return (
    <Providers session={session}>
      <DashboardShell
        userName={session.user.name ?? session.user.email}
        userImage={dbUser?.image ?? null}
      >
        {children}
      </DashboardShell>
    </Providers>
  );
}

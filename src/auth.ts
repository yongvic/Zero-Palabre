import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import { sendMagicLinkEmail } from "@/lib/auth-email";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      id: "resend",
      from:
        process.env.RESEND_FROM_EMAIL ??
        "Zéro-Palabre <onboarding@resend.dev>",
      sendVerificationRequest: sendMagicLinkEmail,
    }),
  ],
  events: {
    async createUser({ user }) {
      await prisma.reliabilityScore.create({
        data: { userId: user.id! },
      });
      await prisma.subscription.create({
        data: { userId: user.id!, plan: "FREE" },
      });
    },
  },
});

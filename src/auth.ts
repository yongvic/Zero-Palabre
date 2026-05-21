import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: process.env.RESEND_FROM_EMAIL ?? "Zéro-Palabre <onboarding@resend.dev>",
    }),
  ],
  pages: {
    signIn: "/connexion",
    verifyRequest: "/connexion/verifier",
    error: "/connexion/erreur",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
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

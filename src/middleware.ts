import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isDashboard =
    path.startsWith("/accords") ||
    path.startsWith("/profil") ||
    path.startsWith("/abonnement") ||
    path === "/tableau-de-bord";

  if (isDashboard && !isLoggedIn) {
    const url = new URL("/connexion", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  if (
    isLoggedIn &&
    (path === "/connexion" || path === "/inscription")
  ) {
    return NextResponse.redirect(new URL("/accords", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/accords/:path*",
    "/profil",
    "/abonnement",
    "/tableau-de-bord",
    "/connexion",
    "/inscription",
  ],
};

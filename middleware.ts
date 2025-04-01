import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
} from "./routes";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const secret = process.env.NEXTAUTH_SECRET;

  const token = await getToken({
    req,
    secret,
    salt:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });

  const isLoggedIn = !!token;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isErrorRoute = nextUrl.pathname.includes("error");

  if (isApiAuthRoute || isPublicRoute || isErrorRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn && token.role === "TravelAgent") {
      return NextResponse.redirect(new URL("/travel-agent/apply-now", nextUrl));
    }
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  if (token) {
    if (pathname.startsWith("/travel-agent")) {
      // Only allow travel agents
      if (token.role === "TravelAgent") {
        return NextResponse.next();
      }

      // Redirect others to login
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    // Non travel-agent paths
    if (!pathname.startsWith("/travel-agent")) {
      // Redirect travel agents to their dashboard
      if (token.role === "TravelAgent") {
        return NextResponse.redirect(
          new URL("/travel-agent/visa-letter", nextUrl)
        );
      }
      // Allow regular users
      return NextResponse.next();
    }
  }

  // 2. Handle auth routes

  // 3. Protected routes - redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl);
    // Preserve the original URL as returnUrl
    loginUrl.searchParams.set("returnUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

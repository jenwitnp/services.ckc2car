import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  try {
    // ✅ Define public routes that don't require authentication
    const publicRoutes = [
      "/login",
      "/cars", // ✅ Allow cars listing page
    ];

    // ✅ Check if current path is public (including all car detail pages)
    const isPublicRoute =
      publicRoutes.some((route) => pathname.startsWith(route)) ||
      pathname.startsWith("/cars/") || // ✅ Allow all car detail pages like /cars/honda-city-2022
      pathname === "/";
    // ✅ Allow all public routes without authentication
    if (isPublicRoute) {
      console.log(`[Middleware] Public route allowed: ${pathname}`);
      return NextResponse.next();
    }

    // Get the token from the request for protected routes
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If user is authenticated and trying to access login page, redirect to home
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If not authenticated and trying to access protected routes, redirect to /login
    if (!token) {
      console.log(`[Middleware] Protected route blocked: ${pathname}`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // ✅ On error, still allow public routes
    const isPublicRoute =
      pathname === "/login" || pathname.startsWith("/cars") || pathname === "/";

    if (isPublicRoute) {
      return NextResponse.next();
    }

    // If error getting token and not on public route, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
      Match all routes except:
      - /login (handled explicitly in middleware)
      - /api (API routes)
      - /_next (Next.js internals)
      - /static, /favicon.ico, /robots.txt, etc.
    */
    "/((?!api|_next|static|favicon.ico|robots.txt).*)",
  ],
};

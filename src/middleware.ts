import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  try {
    // ✅ Define public routes (accessible to everyone including LIFF guests)
    const publicRoutes = [
      "/",
      "/ai-chat",
      "/login",
      "/login/internal",
      "/cars", // ✅ Cars are public for LIFF guests
    ];

    const internalOnlyRoutes = [
      "/dashboard",
      "/admin",
      "/appointments",
      "/analytics",
      "/settings",
    ];

    // ✅ Check if current path is public (including car detail pages)
    const isPublicRoute =
      publicRoutes.some((route) => pathname.startsWith(route)) ||
      pathname.startsWith("/cars/");

    // ✅ Allow all public routes without authentication
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Get the token from the request (for protected routes only)
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Handle unauthenticated users trying to access protected routes
    if (!token) {
      if (internalOnlyRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/login/internal", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Handle authenticated users
    if (token) {
      const userType = token.user?.userType;

      // Redirect internal users accessing wrong login pages
      if (userType === "internal") {
        if (pathname === "/login" || pathname === "/login/internal") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }

      // Prevent non-internal users from accessing internal routes
      if (internalOnlyRoutes.some((route) => pathname.startsWith(route))) {
        if (userType !== "internal") {
          return NextResponse.redirect(new URL("/cars", request.url));
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // On error, allow public routes, redirect others to login
    if (isPublicRoute) {
      return NextResponse.next();
    }

    if (internalOnlyRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/login/internal", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico|robots.txt).*)"],
};

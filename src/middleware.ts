import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  try {
    // ✅ Define public routes accessible to everyone (including LIFF guests)
    const publicRoutes = [
      "/login",
      "/login/internal",
      "/cars",
      "/ai-chat", // ✅ Allow AI chat for guests
    ];

    // ✅ Internal-only routes requiring employee authentication
    const internalOnlyRoutes = [
      "/dashboard",
      "/admin",
      "/appointments",
      "/analytics",
      "/settings",
    ];

    // ✅ Check if current path is public
    const isPublicRoute =
      publicRoutes.some((route) => pathname.startsWith(route)) ||
      pathname.startsWith("/cars/") || // ✅ All car detail pages
      pathname.startsWith("/api/v1/cars") || // ✅ Car API
      pathname.startsWith("/api/v1/ai"); // ✅ AI API

    // ✅ Allow all public routes without authentication
    if (isPublicRoute) {
      console.log(`[Middleware] Public route allowed: ${pathname}`);
      return NextResponse.next();
    }

    // ✅ Check for LIFF user agent for enhanced permissions
    const isLiffRequest =
      request.headers.get("user-agent")?.includes("Line") ||
      searchParams.get("liff") === "true" ||
      request.headers.get("referer")?.includes("liff.line.me");

    // ✅ For LIFF users, allow most routes except internal-only
    if (isLiffRequest) {
      if (internalOnlyRoutes.some((route) => pathname.startsWith(route))) {
        console.log(
          `[Middleware] LIFF user blocked from internal route: ${pathname}`
        );
        return NextResponse.redirect(new URL("/cars", request.url));
      }

      console.log(`[Middleware] LIFF user allowed: ${pathname}`);
      return NextResponse.next();
    }

    // Get authentication token for protected routes
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // ✅ Handle unauthenticated users accessing protected routes
    if (!token) {
      if (internalOnlyRoutes.some((route) => pathname.startsWith(route))) {
        // Redirect to internal login for internal routes
        const redirectUrl = new URL("/login/internal", request.url);
        redirectUrl.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Redirect to regular login for other protected routes
      const redirectUrl = new URL("/login", request.url);
      if (pathname !== "/login") {
        redirectUrl.searchParams.set(
          "returnUrl",
          pathname + request.nextUrl.search
        );
      }
      return NextResponse.redirect(redirectUrl);
    }

    // ✅ Handle authenticated users
    if (token) {
      const userType = token.user?.userType;

      // Redirect authenticated users away from login pages
      if (userType === "internal") {
        if (pathname === "/login" || pathname === "/login/internal") {
          const returnUrl = searchParams.get("returnUrl");
          const redirectTarget =
            returnUrl && !returnUrl.includes("/login")
              ? returnUrl
              : "/dashboard";
          return NextResponse.redirect(new URL(redirectTarget, request.url));
        }
      } else {
        if (pathname === "/login") {
          const returnUrl = searchParams.get("returnUrl");
          const redirectTarget =
            returnUrl && !returnUrl.includes("/login") ? returnUrl : "/cars";
          return NextResponse.redirect(new URL(redirectTarget, request.url));
        }
      }

      // ✅ Prevent non-internal users from accessing internal routes
      if (internalOnlyRoutes.some((route) => pathname.startsWith(route))) {
        if (userType !== "internal") {
          return NextResponse.redirect(new URL("/cars", request.url));
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // ✅ On error, be permissive with public routes
    const isPublicRoute =
      publicRoutes.some((route) => pathname.startsWith(route)) ||
      pathname.startsWith("/cars/");

    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Error fallback redirects
    if (internalOnlyRoutes.some((route) => pathname.startsWith(route))) {
      const redirectUrl = new URL("/login/internal", request.url);
      redirectUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set(
      "returnUrl",
      pathname + request.nextUrl.search
    );
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico|robots.txt).*)"],
};

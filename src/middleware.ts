import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  try {
    // ✅ Define public routes (accessible to everyone including LIFF guests)
    const publicRoutes = [
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
      // ✅ Preserve the original URL for LIFF users
      const isLiffRequest =
        request.headers.get("user-agent")?.includes("Line") ||
        searchParams.get("liff") === "true";

      if (internalOnlyRoutes.some((route) => pathname.startsWith(route))) {
        const redirectUrl = new URL("/login/internal", request.url);

        // ✅ Add original URL as parameter for internal routes
        if (isLiffRequest) {
          redirectUrl.searchParams.set("returnUrl", pathname);
        }

        return NextResponse.redirect(redirectUrl);
      }

      const redirectUrl = new URL("/login", request.url);

      // ✅ Preserve original URL for LIFF users
      if (isLiffRequest && pathname !== "/login") {
        redirectUrl.searchParams.set(
          "returnUrl",
          pathname + request.nextUrl.search
        );
      }

      return NextResponse.redirect(redirectUrl);
    }

    // Handle authenticated users
    if (token) {
      const userType = token.user?.userType;

      // ✅ Enhanced redirect for internal users with URL preservation
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
        // ✅ Enhanced redirect for regular users with URL preservation
        if (pathname === "/login") {
          const returnUrl = searchParams.get("returnUrl");
          const redirectTarget =
            returnUrl && !returnUrl.includes("/login") ? returnUrl : "/cars";

          return NextResponse.redirect(new URL(redirectTarget, request.url));
        }
      }

      // Prevent non-internal users from accessing internal routes
      if (internalOnlyRoutes.some((route) => pathname.startsWith(route))) {
        if (userType !== "internal") {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // ✅ On error, preserve URL if possible
    const isPublicRoute =
      publicRoutes.some((route) => pathname.startsWith(route)) ||
      pathname.startsWith("/cars/");

    if (isPublicRoute) {
      return NextResponse.next();
    }

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

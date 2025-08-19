import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  try {
    // ✅ Define public routes that don't require authentication
    const publicRoutes = [
      "/login",
      "/cars", // Cars listing page
      "/cars/search", // Cars search page
    ];

    // ✅ Define public path patterns
    const publicPatterns = [
      /^\/cars\/[^\/]+$/, // Individual car pages: /cars/toyota-camry-2020-123
      /^\/cars\/search/, // All search pages: /cars/search?q=...
    ];

    // Check if current path is public
    const isPublicRoute =
      publicRoutes.includes(pathname) ||
      publicPatterns.some((pattern) => pattern.test(pathname));

    // Get the token from the request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If user is authenticated and trying to access login page, redirect to home
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If not authenticated and trying to access protected routes, redirect to /login
    if (!token && !isPublicRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // ✅ Handle old car detail URLs
    if (
      pathname.startsWith("/cars/detail/") ||
      pathname.startsWith("/car/detail/")
    ) {
      const carId = pathname.split("/").pop();

      if (carId && /^\d+$/.test(carId)) {
        // For now, redirect to a temporary URL pattern
        // This would ideally fetch the car data to generate proper slug
        const newUrl = new URL(`/cars/temp-${carId}`, request.url);
        return NextResponse.redirect(newUrl, 301);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // If error getting token, check if it's a public route
    const isPublicRoute =
      pathname === "/login" || pathname.startsWith("/cars/");

    if (!isPublicRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
}

// ✅ Updated matcher to be more specific
export const config = {
  matcher: [
    /*
      Match specific routes for authentication:
      - All routes except public ones
      - Still include car detail redirects
    */
    "/((?!login|api|_next|static|favicon.ico|robots.txt).*)",
    "/cars/detail/:path*",
    "/car/detail/:path*",
  ],
};

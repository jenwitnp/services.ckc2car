import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  try {
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
    if (!token && pathname !== "/login") {
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
    // If error getting token, treat as unauthenticated
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
}

// Only run middleware on these routes (protect everything except /login, /api, _next, etc.)
export const config = {
  matcher: [
    /*
      Match all routes except:
      - /login
      - /api (API routes)
      - /_next (Next.js internals)
      - /static, /favicon.ico, /robots.txt, etc.
    */
    "/((?!login|api|_next|static|favicon.ico|robots.txt).*)",
    "/cars/detail/:path*",
    "/car/detail/:path*",
  ],
};

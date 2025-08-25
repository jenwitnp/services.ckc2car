import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ✅ CORS configuration
const CORS_CONFIG = {
  allowedOrigins: [
    "http://localhost",
    "http://localhost",
    "http://localhost",
    "https://www.ckc2car.com",
    "https://ckc2car.com",
    "https://services.ckc2car.com",
  ],
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-API-Key",
  ],
  credentials: true,
};

// ✅ Routes that need CORS (add your analytics route here)
const CORS_ENABLED_ROUTES = [
  "/api/v1/line/messages-customers-count",
  "/api/v1/public/[...slug]",
  // Add other routes that need CORS
];

// ✅ Function to add CORS headers
function addCorsHeaders(response: NextResponse, origin?: string) {
  // Check if origin is allowed
  const isAllowedOrigin =
    origin &&
    (CORS_CONFIG.allowedOrigins.includes(origin) ||
      CORS_CONFIG.allowedOrigins.includes("*"));

  if (isAllowedOrigin || CORS_CONFIG.allowedOrigins.includes("*")) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    CORS_CONFIG.allowedMethods.join(", ")
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    CORS_CONFIG.allowedHeaders.join(", ")
  );
  response.headers.set(
    "Access-Control-Allow-Credentials",
    CORS_CONFIG.credentials.toString()
  );
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours

  return response;
}

// ✅ Check if route needs CORS
function needsCors(pathname: string): boolean {
  return CORS_ENABLED_ROUTES.some((route) => {
    const regexPattern = route
      .replace(/\[\.\.\.[\w]+\]/g, ".*")
      .replace(/\[[\w]+\]/g, "[^/]+")
      .replace(/\//g, "\\/");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(pathname);
  });
}

// ✅ Simplified Route Configuration - Only specify what needs protection
const ROUTE_CONFIG = {
  // Private routes - authentication required
  protected: [
    "/admin",
    "/admin/[...slug]", // All admin sub-routes
    "/dashboard",
    "/profile",
    "/settings",
    "/user/[...slug]", // User profile routes
  ],

  // Admin-only routes (higher level protection)
  adminOnly: [
    "/admin/users",
    "/admin/settings",
    "/admin/analytics",
    "/admin/system",
  ],

  // Protected API routes
  protectedApi: [
    "/api/v1/admin",
    "/api/v1/admin/[...slug]",
    "/api/v1/ai-chat",
    "/api/v1/ai-chat/[...slug]",
    "/api/v1/dashboard",
    "/api/v1/user/profile",
    "/api/v1/protected/[...slug]",
  ],

  // Admin-only API routes
  adminOnlyApi: [
    "/api/v1/admin/users",
    "/api/v1/admin/settings",
    "/api/v1/admin/analytics",
    "/api/v1/admin/system",
  ],

  // ✅ Optional: Routes to explicitly bypass (if needed)
  alwaysPublic: [
    "/api/v1/line/admin-coversation", // LINE webhook
    "/api/v1/auth/[...slug]", // Auth endpoints
    "/api/v1/public/[...slug]", // Public API
    "/api/v1/line/messages-customers-count", // ✅ Add this for testing
    "/health", // Health check
    "/status", // Status check
  ],
};

// ✅ User roles
const USER_ROLES = {
  GUEST: "guest",
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

// ✅ Helper function to check if path matches pattern
function matchesPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const regexPattern = pattern
      .replace(/\[\.\.\.[\w]+\]/g, ".*") // [...slug] -> .*
      .replace(/\[[\w]+\]/g, "[^/]+") // [slug] -> [^/]+
      .replace(/\//g, "\\/"); // escape forward slashes

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(pathname);
  });
}

// ✅ Enhanced function to get user from multiple sources
async function getUserFromRequest(request: NextRequest) {
  try {
    // Method 1: NextAuth JWT token (primary method)
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      console.log("[Middleware] NextAuth token:", token);

      if (token?.user) {
        return {
          id: token.user.id,
          email: token.user.email,
          role: token.user.role || USER_ROLES.USER,
          name: token.user.name,
          position: token.user.position,
          isAuthenticated: true,
          source: "nextauth",
          provider: token.provider,
        };
      }
    } catch (error) {
      console.log("[Middleware] NextAuth token error:", error.message);
    }

    // Method 2: Manual JWT token (fallback)
    const manualToken =
      request.cookies.get("auth-token")?.value ||
      request.cookies.get("session-token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (manualToken) {
      try {
        const payload = JSON.parse(atob(manualToken.split(".")[1]));
        return {
          id: payload.sub || payload.userId,
          email: payload.email,
          role: payload.role || USER_ROLES.USER,
          name: payload.name,
          isAuthenticated: true,
          source: "jwt",
        };
      } catch {
        console.log("[Middleware] Invalid manual JWT token");
      }
    }

    // Method 3: LINE LIFF user
    const liffUserId =
      request.cookies.get("liff-user-id")?.value ||
      request.headers.get("x-line-user-id");

    if (liffUserId) {
      return {
        id: liffUserId,
        role: USER_ROLES.USER,
        isAuthenticated: true,
        source: "liff",
        lineUserId: liffUserId,
      };
    }

    // Method 4: API key for internal services
    const apiKey = request.headers.get("x-api-key");
    if (apiKey && apiKey === process.env.INTERNAL_API_KEY) {
      return {
        id: "api-user",
        role: USER_ROLES.ADMIN,
        isAuthenticated: true,
        source: "api-key",
      };
    }

    return null;
  } catch (error) {
    console.error("[Middleware] Error extracting user:", error);
    return null;
  }
}

// ✅ Main middleware function
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api");
  const origin = request.headers.get("origin");

  console.log(`[Middleware] ${request.method} ${pathname}`);

  // ✅ Handle CORS preflight requests
  if (request.method === "OPTIONS" && needsCors(pathname)) {
    console.log(`[Middleware] CORS preflight for: ${pathname}`);
    const response = new NextResponse(null, { status: 200 });
    return addCorsHeaders(response, origin);
  }

  // ✅ Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    (pathname.includes(".") && !pathname.startsWith("/api"))
  ) {
    return NextResponse.next();
  }

  // ✅ Check if route is explicitly always public
  if (matchesPattern(pathname, ROUTE_CONFIG.alwaysPublic)) {
    console.log(`[Middleware] Always public route: ${pathname}`);
    const response = NextResponse.next();

    // ✅ Add CORS headers if needed
    if (needsCors(pathname)) {
      return addCorsHeaders(response, origin);
    }

    return response;
  }

  // ✅ Get user authentication status
  const user = await getUserFromRequest(request);
  console.log(
    `[Middleware] User:`,
    user ? `${user.id} (${user.role})` : "none"
  );

  // ✅ Handle API routes
  if (isApiRoute) {
    // Check if it's a protected API route
    if (matchesPattern(pathname, ROUTE_CONFIG.protectedApi)) {
      if (!user?.isAuthenticated) {
        console.log(
          `[Middleware] Blocked unauthenticated API access: ${pathname}`
        );
        const response = NextResponse.json(
          { error: "Authentication required", code: "AUTH_REQUIRED" },
          { status: 401 }
        );

        // ✅ Add CORS headers to error response
        if (needsCors(pathname)) {
          return addCorsHeaders(response, origin);
        }

        return response;
      }

      // Check admin-only API routes
      if (matchesPattern(pathname, ROUTE_CONFIG.adminOnlyApi)) {
        if (
          user.role !== USER_ROLES.ADMIN &&
          user.role !== USER_ROLES.SUPER_ADMIN
        ) {
          console.log(`[Middleware] Blocked non-admin API access: ${pathname}`);
          const response = NextResponse.json(
            { error: "Admin access required", code: "ADMIN_REQUIRED" },
            { status: 403 }
          );

          // ✅ Add CORS headers to error response
          if (needsCors(pathname)) {
            return addCorsHeaders(response, origin);
          }

          return response;
        }
      }

      // Add user info to headers for protected API routes
      const response = NextResponse.next();
      response.headers.set("x-user-id", user.id);
      response.headers.set("x-user-role", user.role);
      response.headers.set("x-user-source", user.source);
      if (user.lineUserId) {
        response.headers.set("x-line-user-id", user.lineUserId);
      }

      // ✅ Add CORS headers if needed
      if (needsCors(pathname)) {
        return addCorsHeaders(response, origin);
      }

      return response;
    }

    // ✅ All other API routes are public by default
    console.log(`[Middleware] Public API route: ${pathname}`);
    const response = NextResponse.next();

    // ✅ Add CORS headers if needed
    if (needsCors(pathname)) {
      return addCorsHeaders(response, origin);
    }

    return response;
  }

  // ✅ Handle page routes

  // Check if it's a protected route
  if (matchesPattern(pathname, ROUTE_CONFIG.protected)) {
    if (!user?.isAuthenticated) {
      console.log(
        `[Middleware] Redirecting unauthenticated user to login from: ${pathname}`
      );

      // Store the original URL for redirect after login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);

      return NextResponse.redirect(loginUrl);
    }

    // Check admin-only routes
    if (matchesPattern(pathname, ROUTE_CONFIG.adminOnly)) {
      if (
        user.role !== USER_ROLES.ADMIN &&
        user.role !== USER_ROLES.SUPER_ADMIN
      ) {
        console.log(`[Middleware] Blocked non-admin access to: ${pathname}`);
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    console.log(
      `[Middleware] Authorized access to protected route: ${pathname}`
    );

    // Add user info to response headers for protected routes
    const response = NextResponse.next();
    response.headers.set("x-user-id", user.id);
    response.headers.set("x-user-role", user.role);
    response.headers.set("x-user-authenticated", "true");
    if (user.lineUserId) {
      response.headers.set("x-line-user-id", user.lineUserId);
    }
    return response;
  }

  // ✅ All other routes are public by default
  console.log(`[Middleware] Public route: ${pathname}`);
  return NextResponse.next();
}

// ✅ Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp)$).+)",
  ],
};

// ✅ Export utilities
export { ROUTE_CONFIG, USER_ROLES, matchesPattern };

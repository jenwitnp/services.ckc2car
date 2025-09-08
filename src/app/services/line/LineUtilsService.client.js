"use client";

/**
 * LINE utilities service for client-side use (React components)
 * Contains only browser-safe methods
 */
export class LineUtilsServiceClient {
  /**
   * ✅ Generate LIFF URL for any path (client-side)
   */
  static createLiffUrl(path, options = {}) {
    const {
      liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID, // Note: NEXT_PUBLIC_ prefix for client
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
        "https://services.ckc2car.com",
    } = options;

    if (!liffId) {
      console.warn("LINE_LIFF_ID not configured, using direct URL");
      return path.startsWith("http") ? path : `${baseUrl}${path}`;
    }

    if (path.startsWith("http")) {
      const url = new URL(path);
      path = url.pathname + url.search;
    }

    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `https://liff.line.me/${liffId}${cleanPath}`;
  }

  /**
   * ✅ Generate search LIFF URL with query parameters (client-side)
   */
  static createSearchLiffUrl(query = {}) {
    const searchQuery = {
      ...query,
      page: 1,
      pageSize: 20,
      limit: null,
    };

    const queryParam = encodeURIComponent(JSON.stringify(searchQuery));
    const searchPath = `/cars/search?q=${queryParam}&from=line`;
    return this.createLiffUrl(searchPath);
  }

  /**
   * ✅ Create account linking LIFF URL (client-side)
   */
  static createAccountLinkingUrl(lineUserId, source = "customer") {
    const loginPath = `/login?lineUserId=${lineUserId}&source=${source}&redirect=${encodeURIComponent(
      "/profile"
    )}`;
    return this.createLiffUrl(loginPath);
  }

  /**
   * ✅ Validate LINE user ID format (client-side)
   */
  static isValidLineUserId(userId) {
    if (!userId || typeof userId !== "string") return false;
    return /^U[a-f0-9]{32}$/i.test(userId);
  }

  /**
   * ✅ Sanitize text for LINE message (client-side)
   */
  static sanitizeTextForLine(text, maxLength = 2000) {
    if (!text) return "";

    let sanitized = text.replace(/\s+/g, " ").trim();

    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength - 3) + "...";
    }

    return sanitized;
  }

  // ❌ Note: verifySignature is NOT available on client-side for security reasons
  // ❌ Note: formatMessageForDatabase should not be done on client-side
}

"use client";

/**
 * Generate SEO-friendly URL slug from car data (Client version)
 * @param {object} car - Car data object
 * @returns {string} - SEO-friendly URL slug
 */
export const generateCarSlug = (car) => {
  if (!car) return "";

  const { id, brand_name, model_name, title, years_car, no_car } = car;

  // Create a descriptive slug: brand-model-title-year-carcode
  const parts = [brand_name, model_name, title, years_car, no_car].filter(
    Boolean
  );

  const slug = parts
    .join("-")
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\-]/g, "-") // Allow Thai characters, English, numbers, hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  return `${slug}-${id}`;
};

/**
 * Extract car ID from SEO slug (Client version)
 * @param {string} slug - SEO slug
 * @returns {string|null} - Car ID
 */
export const extractCarIdFromSlug = (slug) => {
  if (!slug) return null;

  // Extract ID from the end of slug (format: ...something-123)
  const match = slug.match(/-(\d+)$/);
  return match ? match[1] : null;
};

/**
 * Generate car detail URL (Client version)
 * @param {object} car - Car data
 * @param {boolean} absolute - Whether to return absolute URL
 * @returns {string} - Car detail URL
 */
export const getCarDetailUrl = (car, absolute = false) => {
  if (!car) return "";

  const slug = generateCarSlug(car);
  const relativePath = `/cars/${slug}`;

  if (absolute) {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.ckc2car.com";
    return `${baseUrl}${relativePath}`;
  }

  return relativePath;
};

/**
 * Generate search URL with parameters (Client version)
 * @param {object} searchParams - Search parameters
 * @param {boolean} fromAI - Whether the search is from AI
 * @returns {string} - Search URL
 */
export const getSearchUrl = (searchParams, fromAI = false) => {
  const queryParam = encodeURIComponent(JSON.stringify(searchParams));
  const fromParam = fromAI ? "&from=ai" : "";
  return `/cars/search?q=${queryParam}${fromParam}`;
};

/**
 * Validate and normalize car URL (Client version)
 * @param {string} currentPath - Current page path
 * @param {object} car - Car data
 * @returns {string|null} - Correct URL if redirect needed, null if current URL is correct
 */
export const validateCarUrl = (currentPath, car) => {
  if (!car || !currentPath) return null;

  const correctUrl = getCarDetailUrl(car);
  const normalizedCurrent = currentPath.replace(/\/$/, ""); // Remove trailing slash
  const normalizedCorrect = correctUrl.replace(/\/$/, "");

  return normalizedCurrent !== normalizedCorrect ? correctUrl : null;
};

/**
 * Client-specific URL utilities
 */

/**
 * Get current page URL for sharing
 * @returns {string} - Current page URL
 */
export const getCurrentPageUrl = () => {
  if (typeof window === "undefined") return "";
  return window.location.href;
};

/**
 * Copy URL to clipboard
 * @param {string} url - URL to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyUrlToClipboard = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error("Failed to copy URL:", error);
    return false;
  }
};

/**
 * Share URL using Web Share API
 * @param {object} shareData - Share data object
 * @returns {Promise<boolean>} - Success status
 */
export const shareUrl = async (shareData) => {
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return true;
    } else {
      // Fallback to clipboard
      return await copyUrlToClipboard(shareData.url);
    }
  } catch (error) {
    console.error("Failed to share URL:", error);
    return false;
  }
};

/**
 * Parse query parameters from URL into a query object for fetchData
 * @param {URLSearchParams|string} searchParams - URL search params or query string
 * @returns {object|null} Query object ready for fetchData or null if invalid
 */
export function parseUrlToQueryObject(searchParams) {
  try {
    // Handle string or URLSearchParams object
    const params =
      typeof searchParams === "string"
        ? new URLSearchParams(searchParams)
        : searchParams;

    // Check if we have the 'q' parameter
    const encodedQuery = params.get("q");

    if (!encodedQuery) return null;

    // Decode and parse
    const decodedString = decodeURIComponent(encodedQuery);
    const queryObject = JSON.parse(decodedString);

    return queryObject;
  } catch (err) {
    console.error("Error parsing URL query parameters:", err);
    return null;
  }
}

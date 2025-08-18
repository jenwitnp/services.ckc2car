/**
 * Format number with commas
 * @param {number|string} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (!num) return "0";
  return parseInt(num).toLocaleString();
}

/**
 * Generates a short, unique, human-readable reference ID.
 * Format: CKC-[4 random alphanumeric chars]
 * Example: CKC-A4B1
 * @returns {string} The generated reference ID.
 */
export function generateReferenceId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "CKC-";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

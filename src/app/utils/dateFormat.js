/**
 * Parses a date string, assuming it's in the Asia/Bangkok timezone if no timezone is specified.
 * This is the correct way to handle local time inputs from the AI.
 * @param {string} dateString - The date string from the AI (e.g., "2025-08-15T15:00:00").
 * @returns {Date} A correct Date object with the proper UTC timestamp.
 */
export function parseDateInBangkok(dateString) {
  // If the AI's string already contains timezone information (like 'Z' for UTC or a +/- offset),
  // the standard Date constructor will handle it correctly.
  if (dateString.includes("Z") || dateString.includes("+")) {
    return new Date(dateString);
  }

  // If no timezone is present, we explicitly append the Bangkok offset (+07:00).
  // This tells the Date constructor to interpret the time as Bangkok time,
  // and it will correctly convert it to the equivalent UTC timestamp for storage.
  // For example, "2025-08-15T15:00:00" becomes "2025-08-15T15:00:00+07:00".
  return new Date(`${dateString}+07:00`);
}

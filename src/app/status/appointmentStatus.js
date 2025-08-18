/**
 * Appointment status constants and utilities
 * Consolidated from /status/appointmentStatus.js
 */

// Status ID mappings
export const APPOINTMENT_STATUS = {
  PENDING: 1, // รอดำเนินการ
  CONFIRMED: 2, // สำเร็จ
  COMPLETED: 2, // Same as confirmed
  CANCELLED: 3, // ยกเลิก
};

// Default status for new appointments
export const DEFAULT_STATUS_ID = APPOINTMENT_STATUS.PENDING;

/**
 * Map status text to database ID
 * Handles both Thai and English inputs
 */
const STATUS_TEXT_TO_ID = {
  // Thai
  รอดำเนินการ: APPOINTMENT_STATUS.PENDING,
  สำเร็จ: APPOINTMENT_STATUS.CONFIRMED,
  ยกเลิก: APPOINTMENT_STATUS.CANCELLED,

  // English
  pending: APPOINTMENT_STATUS.PENDING,
  confirmed: APPOINTMENT_STATUS.CONFIRMED,
  completed: APPOINTMENT_STATUS.COMPLETED,
  cancelled: APPOINTMENT_STATUS.CANCELLED,

  // Alternative spellings
  canceled: APPOINTMENT_STATUS.CANCELLED,
  success: APPOINTMENT_STATUS.CONFIRMED,
  done: APPOINTMENT_STATUS.COMPLETED,
};

/**
 * Get status ID from text
 * @param {string} statusText
 * @returns {number|null}
 */
export function getStatusId(statusText) {
  if (!statusText) return null;

  const normalizedText = statusText.toLowerCase().trim();
  const statusId = STATUS_TEXT_TO_ID[normalizedText];

  if (!statusId) {
    console.warn(`[AppointmentStatus] Unknown status: ${statusText}`);
  }

  return statusId || null;
}

/**
 * Get status text from ID
 * @param {number} statusId
 * @returns {string}
 */
export function getStatusText(statusId) {
  const statusMap = {
    [APPOINTMENT_STATUS.PENDING]: "รอดำเนินการ",
    [APPOINTMENT_STATUS.CONFIRMED]: "สำเร็จ",
    [APPOINTMENT_STATUS.CANCELLED]: "ยกเลิก",
  };

  return statusMap[statusId] || "ไม่ทราบสถานะ";
}

/**
 * Check if status is valid
 * @param {number} statusId
 * @returns {boolean}
 */
export function isValidStatus(statusId) {
  return Object.values(APPOINTMENT_STATUS).includes(statusId);
}

/**
 * Get all available statuses
 * @returns {Array}
 */
export function getAllStatuses() {
  return Object.entries(APPOINTMENT_STATUS).map(([key, value]) => ({
    id: value,
    key: key.toLowerCase(),
    text: getStatusText(value),
  }));
}

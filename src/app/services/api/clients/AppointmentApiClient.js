import { BaseApiClient } from "./BaseApiClient.js";

export class AppointmentApiClient extends BaseApiClient {
  constructor(config = {}) {
    super(config);
    this.resourceName = "appointments";
  }

  /**
   * Create new appointment
   */
  async create(appointmentData) {
    try {
      console.log("[AppointmentApiClient] 🎯 CREATE method called");
      console.log("[AppointmentApiClient] Data received:", appointmentData);

      const result = await this.post(this.resourceName, {
        action: "create",
        ...appointmentData,
      });

      console.log("[AppointmentApiClient] 📋 POST result:", result);
      return result;
    } catch (error) {
      console.error("[AppointmentApiClient] 💥 CREATE error:", error);
      return {
        success: false,
        error: error.message,
        code: "CREATE_APPOINTMENT_ERROR",
      };
    }
  }

  /**
   * Edit appointment by reference ID or customer name
   * @param {object} editData
   * @param {object} user
   * @returns {Promise<object>}
   */
  async edit(editData, user) {
    try {
      console.log(`[AppointmentApiClient] Editing appointment:`, editData);

      return await this.post(this.resourceName, {
        action: "edit",
        user: user,
        ...editData,
      });
    } catch (error) {
      console.error("[AppointmentApiClient] Error editing appointment:", error);
      return {
        success: false,
        error: error.message,
        code: "EDIT_APPOINTMENT_ERROR",
      };
    }
  }

  /**
   * Cancel appointment by reference ID
   * @param {string} referenceId
   * @param {object} user
   * @returns {Promise<object>}
   */
  async cancel(referenceId, user) {
    try {
      console.log(
        `[AppointmentApiClient] Cancelling appointment ${referenceId}`
      );

      return await this.post(this.resourceName, {
        action: "cancel",
        reference_id: referenceId,
        user: user,
      });
    } catch (error) {
      console.error(
        "[AppointmentApiClient] Error cancelling appointment:",
        error
      );
      return {
        success: false,
        error: error.message,
        code: "CANCEL_APPOINTMENT_ERROR",
      };
    }
  }

  /**
   * Search appointments with filters
   * @param {object} searchParams
   * @param {object} user
   * @returns {Promise<object>}
   */
  async search(searchParams, user) {
    try {
      console.log(
        `[AppointmentApiClient] Searching appointments:`,
        searchParams
      );

      return await this.post(this.resourceName, {
        action: "search",
        user: user,
        user_id: user?.id,
        ...searchParams,
      });
    } catch (error) {
      console.error(
        "[AppointmentApiClient] Error searching appointments:",
        error
      );
      return {
        success: false,
        error: error.message,
        code: "SEARCH_APPOINTMENTS_ERROR",
      };
    }
  }

  /**
   * Get appointment by reference ID
   * @param {string} referenceId
   * @param {object} user
   * @returns {Promise<object>}
   */
  async getByReferenceId(referenceId, user) {
    try {
      console.log(
        `[AppointmentApiClient] Getting appointment by reference: ${referenceId}`
      );

      return await this.search({ reference_id: referenceId }, user);
    } catch (error) {
      console.error("[AppointmentApiClient] Error getting appointment:", error);
      return {
        success: false,
        error: error.message,
        code: "GET_APPOINTMENT_ERROR",
      };
    }
  }

  /**
   * Get user's appointments
   * @param {object} user
   * @param {object} filters
   * @returns {Promise<object>}
   */
  async getUserAppointments(user, filters = {}) {
    try {
      console.log(
        `[AppointmentApiClient] Getting appointments for user: ${user?.id}`
      );

      return await this.search(
        {
          employee_id: user.id,
          ...filters,
        },
        user
      );
    } catch (error) {
      console.error(
        "[AppointmentApiClient] Error getting user appointments:",
        error
      );
      return {
        success: false,
        error: error.message,
        code: "GET_USER_APPOINTMENTS_ERROR",
      };
    }
  }

  /**
   * Validate car exists before booking
   * @param {string} carId
   * @returns {Promise<object>}
   */
  async validateCar(carId) {
    try {
      console.log(`[AppointmentApiClient] Validating car: ${carId}`);

      // Use the cars validation endpoint
      return await this.get(`cars/validate`, { car_id: carId });
    } catch (error) {
      console.error("[AppointmentApiClient] Error validating car:", error);
      return {
        success: false,
        error: error.message,
        code: "VALIDATE_CAR_ERROR",
      };
    }
  }

  /**
   * Get appointment statistics for user
   * @param {object} user
   * @returns {Promise<object>}
   */
  async getStats(user) {
    try {
      console.log(`[AppointmentApiClient] Getting stats for user: ${user?.id}`);

      const result = await this.search({}, user);

      if (!result.success) {
        return result;
      }

      const appointments = result.data || [];
      const now = new Date();

      const stats = {
        total: appointments.length,
        upcoming: appointments.filter((apt) => new Date(apt.start_time) > now)
          .length,
        past: appointments.filter((apt) => new Date(apt.start_time) <= now)
          .length,
        cancelled: appointments.filter((apt) => apt.status_id === 3).length,
      };

      return {
        success: true,
        data: stats,
        summary: `สถิติการนัดหมาย: ทั้งหมด ${stats.total} รายการ (ที่จะมาถึง ${stats.upcoming}, ผ่านมาแล้ว ${stats.past}, ยกเลิก ${stats.cancelled})`,
      };
    } catch (error) {
      console.error("[AppointmentApiClient] Error getting stats:", error);
      return {
        success: false,
        error: error.message,
        code: "GET_STATS_ERROR",
      };
    }
  }

  /**
   * Check for appointment conflicts
   * @param {object} appointmentData
   * @returns {Promise<object>}
   */
  async checkConflicts(appointmentData) {
    try {
      console.log(
        `[AppointmentApiClient] Checking conflicts for:`,
        appointmentData
      );

      const { start_time, end_time, car_id, employee_id } = appointmentData;

      if (!start_time || !car_id || !employee_id) {
        return {
          success: false,
          error: "Missing required fields for conflict check",
        };
      }

      // Check for same car conflicts
      const carConflicts = await this.search(
        {
          car_id: car_id,
          start_date: start_time,
          end_date: end_time || start_time,
        },
        { id: employee_id }
      );

      // Check for same employee conflicts
      const employeeConflicts = await this.search(
        {
          employee_id: employee_id,
          start_date: start_time,
          end_date: end_time || start_time,
        },
        { id: employee_id }
      );

      const hasConflicts =
        carConflicts.data?.length > 0 || employeeConflicts.data?.length > 0;

      return {
        success: true,
        hasConflicts,
        carConflicts: carConflicts.data || [],
        employeeConflicts: employeeConflicts.data || [],
        summary: hasConflicts
          ? "พบการนัดหมายที่มีเวลาซ้อนทับ"
          : "ไม่พบการนัดหมายที่ขัดแย้ง",
      };
    } catch (error) {
      console.error("[AppointmentApiClient] Error checking conflicts:", error);
      return {
        success: false,
        error: error.message,
        code: "CHECK_CONFLICTS_ERROR",
      };
    }
  }
}

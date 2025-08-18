import { apiFactory } from "@/app/services/api/ApiFactory.js";

export const appointmentHandlers = {
  /**
   * Book new appointment using API client
   */
  async bookAppointment(args, user) {
    if (!user || !user.id) {
      return {
        success: false,
        summary: "ขออภัยค่ะ ต้องเข้าสู่ระบบก่อนทำการนัดหมาย",
        isAppointmentBooked: false,
      };
    }

    try {
      console.log("[AppointmentHandler] Booking appointment via API:", args);

      // Prepare appointment data with user info
      const appointmentData = {
        ...args,
        employee_id: user.id, // Always use the actual user ID
      };

      // Create appointment via API
      const result = await apiFactory.appointments.create(appointmentData);

      console.log("[Appointment Handler] create result : ", result);

      if (result.success) {
        return {
          success: true,
          summary: result.data.summary || `✅ บันทึกการนัดหมายเรียบร้อยแล้ว`,
          isAppointmentBooked: true,
          count: 1,
          rawData: [result.data],
        };
      }

      return {
        success: false,
        summary:
          result.summary ||
          result.error ||
          "ขออภัยค่ะ เกิดข้อผิดพลาดในการทำนัดหมาย",
        isAppointmentBooked: false,
      };
    } catch (error) {
      console.error("[AppointmentHandler] Booking error:", error);
      return {
        success: false,
        summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในระบบการนัดหมาย",
        error: error.message,
        isAppointmentBooked: false,
      };
    }
  },

  /**
   * Edit appointment using API client
   */
  async editAppointment(args, user) {
    if (!user || !user.id) {
      return {
        success: false,
        summary: "ขออภัยค่ะ ต้องเข้าสู่ระบบก่อนแก้ไขนัดหมาย",
      };
    }

    try {
      console.log("[AppointmentHandler] Editing appointment via API:", args);

      const result = await apiFactory.appointments.edit(args, user);

      if (result.success) {
        return {
          success: true,
          summary: result.summary || `✅ แก้ไขนัดหมายเรียบร้อยแล้วค่ะ`,
          count: 1,
          rawData: [result.data],
        };
      }

      return {
        success: false,
        summary:
          result.summary ||
          result.error ||
          "ขออภัยค่ะ ไม่สามารถแก้ไขนัดหมายได้",
      };
    } catch (error) {
      console.error("[AppointmentHandler] Edit error:", error);
      return {
        success: false,
        summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในการแก้ไขนัดหมาย",
        error: error.message,
      };
    }
  },

  /**
   * Cancel appointment using API client
   */
  async cancelAppointment(args, user) {
    if (!user) {
      return {
        success: false,
        summary: "ต้องเข้าสู่ระบบก่อนยกเลิกนัดหมาย",
      };
    }

    try {
      console.log("[AppointmentHandler] Cancelling appointment via API:", args);

      if (!args.reference_id) {
        return {
          success: false,
          summary: "กรุณาระบุรหัสอ้างอิงของนัดหมายที่ต้องการยกเลิกค่ะ",
        };
      }

      const result = await apiFactory.appointments.cancel(
        args.reference_id,
        user
      );

      if (result.success) {
        return {
          success: true,
          summary:
            result.summary ||
            `✅ ยกเลิกนัดหมายรหัส ${args.reference_id} เรียบร้อยแล้วค่ะ`,
        };
      }

      return {
        success: false,
        summary:
          result.summary ||
          result.error ||
          "ขออภัยค่ะ ไม่สามารถยกเลิกนัดหมายได้",
      };
    } catch (error) {
      console.error("[AppointmentHandler] Cancel error:", error);
      return {
        success: false,
        summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในการยกเลิกนัดหมาย",
        error: error.message,
      };
    }
  },
};

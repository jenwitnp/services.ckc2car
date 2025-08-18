import { fetchData, saveData, updateData } from "./query";
import { parseDateInBangkok } from "@/app/utils/dateFormat";
import { generateReferenceId } from "@/app/utils/generateReferenceId";

import { getUserPermissions } from "@/app/roles/roleBaseAccess";
import { getStatusId } from "@/app/status/appointmentStatus";

/**
 * Checks if a car exists in the database by its ID (no_car).
 * @param {string} carId - The car ID (e.g., "W065").
 * @returns {Promise<boolean>} - True if the car exists, false otherwise.
 */
async function checkCarExists(carId) {
  if (!carId) return false;
  // --- FIX: Select the user-friendly code as well ---
  const { success, data } = await fetchData("cars", {
    filters: { no_car: carId.toUpperCase() },
    select: "id, no_car", // Get both the database ID and the display code
    single: true,
  });
  return { success, data };
}

/**
 * Creates a new appointment after validating the car and other data.
 * This function encapsulates the entire business logic for booking.
 * @param {object} args - The appointment arguments from the AI.
 * @returns {Promise<object>} - The result object to be sent back to the AI.
 */
export async function createAppointment(args) {
  // 1. Check if the car exists
  const carCheckResult = await checkCarExists(args.car_id);
  if (!carCheckResult.success || !carCheckResult.data) {
    return {
      success: false,
      summary: `ขออภัยค่ะ ไม่พบรถรหัส "${args.car_id}" ในระบบ`,
      isAppointmentBooked: false,
    };
  }
  const carDatabaseId = carCheckResult.data.id;
  const carDisplayCode = carCheckResult.data.no_car;

  // 2. Handle appointment times (with default duration)
  const startTime = parseDateInBangkok(args.start_time);
  let endTime;
  if (args.end_time) {
    endTime = parseDateInBangkok(args.end_time);
  } else {
    // Default to a 1-hour appointment if end_time is not provided
    endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
  }

  const appointmentData = {
    reference_id: generateReferenceId(),
    employee_id: args.employee_id,
    car_id: carDatabaseId,
    customer_name: args.customer_name || "ไม่ระบุชื่อ",
    phone: args.phone,
    location: args.location,
    appointment_purpose: args.appointment_purpose,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status_id: DEFAULT_STATUS_ID,
    notes: `นัดหมายผ่าน AI assistant - ${new Date().toLocaleDateString(
      "th-TH"
    )}`,
  };

  // 3. Validate appointment date (must be in the future)
  const currentDate = new Date();
  if (startTime.getTime() <= currentDate.getTime()) {
    return {
      success: false,
      summary: `กรุณาระบุวันและเวลาเริ่มต้นนัดหมายในอนาคต`,
      isAppointmentBooked: false,
    };
  }

  // 4. Save the appointment
  const result = await saveData("appointments", appointmentData);
  if (!result || !result.success) {
    return {
      success: false,
      summary: `ขออภัยค่ะ เกิดข้อผิดพลาดในการบันทึกการนัดหมาย`,
      isAppointmentBooked: false,
    };
  }

  // 5. Format success response
  const formattedStartTime = startTime.toLocaleString("th-TH", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });
  const formattedEndTime = endTime.toLocaleTimeString("th-TH", {
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });

  return {
    success: true,
    summary: `✅ บันทึกการนัดหมายเรียบร้อยแล้ว\n\n📋 **รายละเอียดการนัด**\nรหัสรถ: ${carDisplayCode}\nชื่อลูกค้า: ${appointmentData.customer_name}\nสถานที่: ${appointmentData.location}\nวันและเวลา: ${formattedStartTime} - ${formattedEndTime}\nจุดประสงค์การนัด: ${appointmentData.appointment_purpose}`,
    isAppointmentBooked: true,
  };
}

export async function editAppointment(args) {
  const { reference_id, customer_name } = args;
  let appointmentToEdit;

  // --- Strategy 1: Find by unique Reference ID (Preferred) ---
  if (reference_id) {
    const { success, data } = await fetchData("appointments", {
      filters: { reference_id: reference_id.toUpperCase() }, // Standardize to uppercase
      select: "id, customer_name, location, start_time, reference_id",
      single: true,
    });
    if (!success || !data) {
      return {
        success: false,
        summary: `ขออภัยค่ะ ไม่พบข้อมูลนัดหมายรหัสอ้างอิง "${reference_id}"`,
      };
    }
    appointmentToEdit = data;
  }
  // --- Strategy 2: Find by Customer Name (Fallback with ambiguity check) ---
  else if (customer_name) {
    const { success, data: appointments } = await fetchData("appointments", {
      filters: { customer_name: customer_name },
      select: "id, customer_name, location, start_time, reference_id",
    });

    if (!success || !appointments || appointments.length === 0) {
      return {
        success: false,
        summary: `ขออภัยค่ะ ไม่พบข้อมูลนัดหมายสำหรับคุณ "${customer_name}"`,
      };
    }

    // If more than one appointment is found, ask the user to clarify.
    if (appointments.length > 1) {
      let summary = `พบการนัดหมายของคุณ "${customer_name}" มากกว่า 1 รายการค่ะ กรุณาระบุรหัสอ้างอิงเพื่อแก้ไข:\n\n`;
      appointments.forEach((appt) => {
        const date = new Date(appt.start_time).toLocaleString("th-TH", {
          dateStyle: "short",
          timeStyle: "short",
        });
        summary += `• นัดวันที่ ${date} (รหัส: ${appt.reference_id})\n`;
      });
      return { success: false, summary: summary.trim() };
    }
    appointmentToEdit = appointments[0];
  }
  // --- Strategy 3: No identifier provided ---
  else {
    return {
      success: false,
      summary: "กรุณาระบุชื่อลูกค้าหรือรหัสอ้างอิงของนัดหมายที่ต้องการแก้ไขค่ะ",
    };
  }

  // 2. Prepare the update payload
  const updatePayload = {};
  if (args.status) {
    const statusId = getStatusId(args.status);
    if (statusId) updatePayload.status_id = statusId;
  }
  if (args.start_time)
    updatePayload.start_time = parseDateInBangkok(
      args.start_time
    ).toISOString();
  if (args.end_time)
    updatePayload.end_time = parseDateInBangkok(args.end_time).toISOString();
  if (args.location) updatePayload.location = args.location;
  // ... add any other fields that can be edited

  if (Object.keys(updatePayload).length === 0) {
    return {
      success: false,
      summary: `กรุณาระบุข้อมูลที่ต้องการแก้ไขสำหรับนัดหมายรหัส ${appointmentToEdit.reference_id} ค่ะ`,
    };
  }

  // 3. Perform the update using the unique primary key
  const { success: updateSuccess, data: updatedData } = await updateData(
    "appointments",
    updatePayload,
    { id: appointmentToEdit.id }
  );

  if (updateSuccess) {
    return {
      success: true,
      summary: `✅ แก้ไขนัดหมายรหัส ${appointmentToEdit.reference_id} เรียบร้อยแล้วค่ะ`,
    };
  } else {
    return {
      success: false,
      summary: `ขออภัยค่ะ เกิดข้อผิดพลาดขณะพยายามแก้ไขข้อมูลนัดหมาย`,
    };
  }
}

export async function cancelAppointment(args, user) {
  console.log("cancel appointment run");
  const { reference_id } = args;
  if (!reference_id) {
    return {
      success: false,
      summary: "กรุณาระบุรหัสอ้างอิงของนัดหมายที่ต้องการยกเลิกค่ะ",
    };
  }

  const permissions = getUserPermissions(user);
  const filters = { reference_id: reference_id.toUpperCase() };

  // Security Rule: If user is not a CEO, they can only cancel their own appointments.
  if (!permissions.canViewAll) {
    filters.employee_id = user.id;
  }

  // 1. Find the appointment first to ensure it exists and user has permission
  const { success: fetchSuccess, data: appointment } = await fetchData(
    "appointments",
    {
      filters,
      select: "id",
      single: true,
    }
  );

  if (!fetchSuccess || !appointment) {
    return {
      success: false,
      summary: `ไม่พบนัดหมายรหัส ${reference_id} หรือคุณไม่มีสิทธิ์ในการยกเลิกนัดหมายนี้ค่ะ`,
    };
  }

  console.log("appointment is ", appointment);

  // 2. Update the status to 'cancelled'
  const cancelledStatusId = getStatusId("cancelled");
  const { success: updateSuccess } = await updateData(
    "appointments",
    { status_id: cancelledStatusId },
    { id: appointment.id } // Update using the primary key
  );

  if (updateSuccess) {
    return {
      success: true,
      summary: `✅ ยกเลิกนัดหมายรหัส ${reference_id} เรียบร้อยแล้วค่ะ`,
    };
  } else {
    return {
      success: false,
      summary: `ขออภัยค่ะ เกิดข้อผิดพลาดขณะพยายามยกเลิกนัดหมาย`,
    };
  }
}

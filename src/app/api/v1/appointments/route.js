import { NextResponse } from "next/server";
import {
  fetchData,
  saveData, // ✅ Change from insertData to saveData
  updateData,
} from "@/app/services/supabase/query.js";
import { getUserPermissions } from "@/app/roles/roleBaseAccess.js";
import {
  getStatusId,
  DEFAULT_STATUS_ID,
} from "@/app/status/appointmentStatus.js";
import { parseDateInBangkok } from "@/app/utils/dateFormat.js";
import { generateReferenceId } from "@/app/utils/generateReferenceId.js";

export async function POST(request) {
  try {
    console.log("[Appointments API] 🎯 POST endpoint reached");

    const body = await request.json();
    console.log("[Appointments API] 📥 Request body:", body);

    const { action, ...args } = body;

    console.log(`[Appointments API] 🔍 Action: ${action}`);
    console.log(`[Appointments API] 🔍 Args:`, args);

    let result;

    switch (action) {
      case "create":
        console.log("[Appointments API] 🚀 Calling handleCreateAppointment");
        result = await handleCreateAppointment(args);
        console.log(
          "[Appointments API] 📋 handleCreateAppointment result:",
          result
        );
        break;

      case "edit":
        result = await handleEditAppointment(args);
        break;

      case "cancel":
        result = await handleCancelAppointment(args);
        break;

      case "search":
        result = await handleSearchAppointments(args);
        break;

      default:
        console.log("[Appointments API] ❌ Unknown action:", action);
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: ${action}`,
          },
          { status: 400 }
        );
    }

    console.log("[Appointments API] 📤 Final result:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Appointments API] 💥 Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: "APPOINTMENT_API_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle appointment creation
 */
async function handleCreateAppointment(args) {
  try {
    console.log("[Appointments API] 🎯 handleCreateAppointment started");
    console.log("[Appointments API] 📥 Args:", args);

    // 1. Validate car exists
    console.log(`[Appointments API] 🔍 Validating car: ${args.car_id}`);
    const carValidation = await validateCar(args.car_id);
    console.log("[Appointments API] 🚗 Car validation result:", carValidation);

    if (!carValidation.success) {
      console.log("[Appointments API] ❌ Car validation failed");
      return {
        success: false,
        summary: `ขออภัยค่ะ ไม่พบรถรหัส "${args.car_id}" ในระบบ`,
        isAppointmentBooked: false,
      };
    }

    // 2. Handle appointment times
    const startTime = parseDateInBangkok(args.start_time);
    let endTime;
    if (args.end_time) {
      endTime = parseDateInBangkok(args.end_time);
    } else {
      // Default to 1 hour
      endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    }

    // 3. Validate appointment is in future
    const currentDate = new Date();
    if (startTime.getTime() <= currentDate.getTime()) {
      return {
        success: false,
        summary: `กรุณาระบุวันและเวลาเริ่มต้นนัดหมายในอนาคต`,
        isAppointmentBooked: false,
      };
    }

    // 4. Generate reference ID
    const referenceId = generateReferenceId();

    // 5. Prepare appointment data
    const appointmentData = {
      reference_id: referenceId,
      employee_id: args.employee_id,
      car_id: carValidation.data.id, // Use database ID
      customer_name: args.customer_name || "ไม่ระบุชื่อ",
      phone: args.phone,
      location: args.location,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      appointment_purpose: args.appointment_purpose,
      status_id: DEFAULT_STATUS_ID,
      notes: `นัดหมายผ่าน AI assistant - ${new Date().toLocaleDateString(
        "th-TH"
      )}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 6. Insert appointment - ✅ Change from insertData to saveData
    const insertResult = await saveData("appointments", appointmentData);

    if (!insertResult.success) {
      return {
        success: false,
        summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในการบันทึกนัดหมาย",
        isAppointmentBooked: false,
        error: insertResult.error,
      };
    }

    // 7. Format success response
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
      summary: `✅ บันทึกการนัดหมายเรียบร้อยแล้ว\n\n📋 **รายละเอียดการนัด**\nรหัสอ้างอิง: ${referenceId}\nรหัสรถ: ${carValidation.data.no_car}\nชื่อลูกค้า: ${appointmentData.customer_name}\nสถานที่: ${appointmentData.location}\nวันและเวลา: ${formattedStartTime} - ${formattedEndTime}\nจุดประสงค์การนัด: ${appointmentData.appointment_purpose}`,
      isAppointmentBooked: true,
      data: {
        reference_id: referenceId,
        car_display_code: carValidation.data.no_car,
        customer_name: args.customer_name,
        start_time: startTime.toISOString(),
        location: args.location,
        summary: `✅ บันทึกการนัดหมายเรียบร้อยแล้ว\n\n📋 **รายละเอียดการนัด**\nรหัสอ้างอิง: ${referenceId}\nรหัสรถ: ${carValidation.data.no_car}\nชื่อลูกค้า: ${appointmentData.customer_name}\nสถานที่: ${appointmentData.location}\nวันและเวลา: ${formattedStartTime} - ${formattedEndTime}\nจุดประสงค์การนัด: ${appointmentData.appointment_purpose}`,
      },
    };
  } catch (error) {
    console.error(
      "[Appointments API] 💥 handleCreateAppointment error:",
      error
    );
    return {
      success: false,
      summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในการสร้างนัดหมาย",
      isAppointmentBooked: false,
      error: error.message,
    };
  }
}

/**
 * Handle appointment editing
 */
async function handleEditAppointment(args) {
  try {
    console.log("[Appointments API] Editing appointment:", args);

    const { user, reference_id, customer_name, status, ...updateData } = args;

    if (!user) {
      return {
        success: false,
        summary: "ขออภัยค่ะ ต้องเข้าสู่ระบบก่อนแก้ไขนัดหมาย",
      };
    }

    const permissions = getUserPermissions(user);
    let filters = {};

    // Find appointment by reference_id or customer_name
    if (reference_id) {
      filters.reference_id = reference_id.toUpperCase();
    } else if (customer_name) {
      filters.customer_name = customer_name;
    } else {
      return {
        success: false,
        summary: "กรุณาระบุรหัสอ้างอิงหรือชื่อลูกค้าค่ะ",
      };
    }

    // Apply security filters
    if (!permissions.canViewAll) {
      filters.employee_id = user.id;
    }

    // Find the appointment
    const findResult = await fetchData("appointments", {
      filters,
      select: "id, reference_id, customer_name",
      single: true,
    });

    if (!findResult.success || !findResult.data) {
      return {
        success: false,
        summary: "ไม่พบนัดหมายที่ระบุ หรือคุณไม่มีสิทธิ์ในการแก้ไข",
      };
    }

    // Prepare update data
    const dataToUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      const statusId = getStatusId(status);
      if (statusId) {
        dataToUpdate.status_id = statusId;
      }
    }

    // Handle time updates
    if (updateData.start_time) {
      dataToUpdate.start_time = parseDateInBangkok(
        updateData.start_time
      ).toISOString();
    }
    if (updateData.end_time) {
      dataToUpdate.end_time = parseDateInBangkok(
        updateData.end_time
      ).toISOString();
    }

    // Add other update fields if provided
    ["location", "phone", "appointment_purpose"].forEach((field) => {
      if (updateData[field] !== undefined && updateData[field] !== null) {
        dataToUpdate[field] = updateData[field];
      }
    });

    if (Object.keys(dataToUpdate).length <= 1) {
      // Only updated_at
      return {
        success: false,
        summary: `กรุณาระบุข้อมูลที่ต้องการแก้ไขสำหรับนัดหมายรหัส ${findResult.data.reference_id} ค่ะ`,
      };
    }

    // Update appointment
    const updateResult = await updateData("appointments", dataToUpdate, {
      id: findResult.data.id,
    });

    if (updateResult.success) {
      return {
        success: true,
        summary: `✅ แก้ไขนัดหมายรหัส ${findResult.data.reference_id} เรียบร้อยแล้วค่ะ`,
        data: findResult.data,
      };
    }

    return {
      success: false,
      summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในการแก้ไขนัดหมาย",
      error: updateResult.error,
    };
  } catch (error) {
    console.error("[Appointments API] Edit error:", error);
    return {
      success: false,
      summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในการแก้ไขนัดหมาย",
      error: error.message,
    };
  }
}

/**
 * Handle appointment cancellation
 */
async function handleCancelAppointment(args) {
  try {
    console.log("[Appointments API] Cancelling appointment:", args);

    const { user, reference_id } = args;

    if (!user || !reference_id) {
      return {
        success: false,
        summary: "ข้อมูลไม่ครบถ้วน กรุณาระบุรหัสอ้างอิงและเข้าสู่ระบบ",
      };
    }

    const permissions = getUserPermissions(user);
    const filters = { reference_id: reference_id.toUpperCase() };

    // Apply security filters
    if (!permissions.canViewAll) {
      filters.employee_id = user.id;
    }

    // Find appointment
    const findResult = await fetchData("appointments", {
      filters,
      select: "id, reference_id",
      single: true,
    });

    if (!findResult.success || !findResult.data) {
      return {
        success: false,
        summary: `ไม่พบนัดหมายรหัส ${reference_id} หรือคุณไม่มีสิทธิ์ในการยกเลิก`,
      };
    }

    // Cancel appointment (update status)
    const cancelledStatusId = getStatusId("cancelled");
    const updateResult = await updateData(
      "appointments",
      {
        status_id: cancelledStatusId,
        updated_at: new Date().toISOString(),
      },
      { id: findResult.data.id }
    );

    if (updateResult.success) {
      return {
        success: true,
        summary: `✅ ยกเลิกนัดหมายรหัส ${reference_id} เรียบร้อยแล้วค่ะ`,
      };
    }

    return {
      success: false,
      summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในการยกเลิกนัดหมาย",
      error: updateResult.error,
    };
  } catch (error) {
    console.error("[Appointments API] Cancel error:", error);
    return {
      success: false,
      summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในการยกเลิกนัดหมาย",
      error: error.message,
    };
  }
}

/**
 * Handle appointment search
 */
async function handleSearchAppointments(args) {
  try {
    console.log("[Appointments API] Searching appointments:", args);

    const { user, ...searchParams } = args;

    if (!user) {
      return {
        success: false,
        summary: "กรุณาเข้าสู่ระบบเพื่อค้นหานัดหมาย",
        data: [],
        count: 0,
      };
    }

    const permissions = getUserPermissions(user);

    const options = {
      filters: {},
      search: [],
      gte: {},
      lte: {},
      select: "*,cars(no_car), appointment_statuses(id, text)",
    };

    // Handle customer name search
    if (searchParams.customer_name) {
      options.search.push({
        column: "customer_name",
        query: searchParams.customer_name,
      });
    }

    // Apply permission filters
    if (searchParams.employee_id) {
      if (permissions.canViewAll) {
        options.filters.employee_id = searchParams.employee_id;
      } else {
        options.filters.employee_id = user.id;
      }
    } else if (!permissions.canViewAll) {
      options.filters.employee_id = user.id;
    }

    // Apply other filters
    if (searchParams.status) {
      const statusId = getStatusId(searchParams.status);
      if (statusId) {
        options.filters.status_id = statusId;
      }
    }

    if (searchParams.start_date) {
      options.gte.start_time = searchParams.start_date;
    }
    if (searchParams.end_date) {
      options.lte.start_time = searchParams.end_date;
    }

    const result = await fetchData("appointments", options);

    if (!result.success || !result.data || result.data.length === 0) {
      return {
        success: true,
        data: [],
        count: 0,
        summary: "ไม่พบข้อมูลนัดหมายตามเงื่อนไขที่ระบุค่ะ",
      };
    }

    return {
      success: true,
      data: result.data,
      count: result.data.length,
      summary: `พบข้อมูลนัดหมายทั้งหมด ${result.data.length} รายการ`,
    };
  } catch (error) {
    console.error("[Appointments API] Search error:", error);
    return {
      success: false,
      error: error.message,
      data: [],
      count: 0,
      code: "SEARCH_APPOINTMENTS_ERROR",
    };
  }
}

/**
 * Validate car exists
 */
async function validateCar(carId) {
  try {
    console.log(`[Appointments API] 🎯 validateCar started for: ${carId}`);

    if (!carId) {
      console.log("[Appointments API] ❌ No car ID provided");
      return { success: false, error: "Car ID is required" };
    }

    console.log(
      `[Appointments API] 🔍 Searching for car: ${carId.toUpperCase()}`
    );

    const { success, data } = await fetchData("cars", {
      filters: { no_car: carId.toUpperCase() },
      select: "id, no_car",
      single: true,
    });

    console.log("[Appointments API] 🚗 Database query result:", {
      success,
      data,
    });
    console.log("validcar : ", data); // Your existing log

    if (!success || !data) {
      console.log("[Appointments API] ❌ Car not found in database");
      return {
        success: false,
        error: `Car with ID "${carId}" not found`,
      };
    }

    console.log("[Appointments API] ✅ Car found:", data);
    return { success: true, data };
  } catch (error) {
    console.error("[Appointments API] 💥 validateCar error:", error);
    return {
      success: false,
      error: `Car validation failed: ${error.message}`,
    };
  }
}

import { fetchData } from "@/app/services/supabase/query";
import { getUserPermissions } from "@/app/roles/roleBaseAccess.js"; // ✅ Add .js
import { getStatusId } from "../../../status/appointmentStatus.js"; // ✅ Add .js

export const queryAppointmentsHandlers = {
  async queryAppointments(args, user) {
    if (!user) {
      return {
        success: false,
        summary: "กรุณาเข้าสู่ระบบเพื่อดูข้อมูลนัดหมาย",
        count: 0,
        rawData: [],
      };
    }

    const permissions = getUserPermissions(user);
    console.log(
      `[QueryAppointments] User: ${user.id} ${user.name}, Role: ${
        user.position
      }, Permissions: ${JSON.stringify(permissions)}`
    );
    console.log(
      `[QueryAppointments] Arguments from AI:`,
      JSON.stringify(args, null, 2)
    );

    // Handle CURRENT_USER resolution
    if (args.employee_id === "CURRENT_USER") {
      console.log(
        `[QueryAppointments] AI requested 'CURRENT_USER'. Resolving to user ID: ${user.id}`
      );
      args.employee_id = user.id;
    }

    const options = {
      filters: {},
      search: [],
      gte: {},
      lte: {},
      select: "*,cars(no_car), appointment_statuses(id, text)",
    };

    // 1. Handle customer name search
    if (args.customer_name) {
      options.search.push({
        column: "customer_name",
        query: args.customer_name,
      });
    }

    // 2. Apply mandatory permission filters
    if (args.employee_id) {
      if (permissions.canViewAll) {
        options.filters.employee_id = args.employee_id;
        console.log(
          `[QueryAppointments] CEO can view employee: ${args.employee_id}`
        );
      } else {
        // Security Override: Force non-CEO to their own ID
        options.filters.employee_id = user.id;
        console.log(`[QueryAppointments] Non-CEO forced to own ID: ${user.id}`);
      }
    } else if (!permissions.canViewAll) {
      options.filters.employee_id = user.id;
      console.log(`[QueryAppointments] Non-CEO default to own ID: ${user.id}`);
    } else {
      console.log(`[QueryAppointments] CEO can view all appointments`);
    }

    // 3. Apply other filters
    if (args.status) {
      const statusId = getStatusId(args.status);
      if (statusId) {
        options.filters.status_id = statusId;
        console.log(
          `[QueryAppointments] Status filter: ${args.status} -> ${statusId}`
        );
      } else {
        console.warn(`[QueryAppointments] Unknown status: ${args.status}`);
      }
    }

    if (args.start_date) {
      options.gte.start_time = args.start_date;
      console.log(`[QueryAppointments] Start date filter: ${args.start_date}`);
    }
    if (args.end_date) {
      options.lte.start_time = args.end_date;
      console.log(`[QueryAppointments] End date filter: ${args.end_date}`);
    }

    console.log(
      "[QueryAppointments] Final query options:",
      JSON.stringify(options, null, 2)
    );

    try {
      const {
        success,
        data: appointments,
        count,
        error: queryError,
      } = await fetchData("appointments", options);

      // Handle query failure
      if (!success) {
        console.error("[QueryAppointments] Query failed:", queryError);
        return {
          success: false,
          summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในการค้นหาข้อมูลนัดหมาย",
          error: queryError,
          count: 0,
          rawData: [],
        };
      }

      // Handle empty results
      if (!appointments || appointments.length === 0) {
        console.log("[QueryAppointments] No appointments found");
        return {
          success: true,
          summary: "ไม่พบข้อมูลนัดหมายตามเงื่อนไขที่ระบุค่ะ",
          count: 0,
          rawData: [],
          isQuery: true,
        };
      }

      // Success with data
      const summary = `พบข้อมูลนัดหมายทั้งหมด ${appointments.length} รายการ`;

      console.log(
        `[QueryAppointments] Found ${appointments.length} appointments`
      );
      console.log(
        `[QueryAppointments] Sample appointment:`,
        appointments[0]
          ? {
              id: appointments[0].id,
              customer_name: appointments[0].customer_name,
              start_time: appointments[0].start_time,
            }
          : "None"
      );

      return {
        success: true,
        summary,
        count: appointments.length,
        rawData: appointments,
        isQuery: true,
      };
    } catch (error) {
      console.error("[QueryAppointments] Error:", error);
      console.error("[QueryAppointments] Error stack:", error.stack);
      return {
        success: false,
        summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในการค้นหาข้อมูลนัดหมาย",
        error: error.message,
        count: 0,
        rawData: [],
      };
    }
  },
};

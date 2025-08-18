import { fetchData } from "@/app/services/supabase/query";

// Extract ONLY the handler logic from your existing carQueryTool.js
export const carHandlers = {
  async queryCarsComprehensive(args) {
    try {
      console.log(
        "[carHandlers] queryCarsComprehensive called with args:",
        args
      );

      const result = await fetchData("cars_full_view", args);

      if (
        result &&
        result.success &&
        Array.isArray(result.data) &&
        result.data.length > 0
      ) {
        const referenceData = result.data.map((item) => ({
          id: item.id,
          key_word: item.key_word,
          ชื่อสินค้า: item.title,
          ยี่ห้อ: item.brand_name,
          รุ่น: item.model_name,
          ประเภท: item.car_type_title,
          สาขา: item.branch_name,
          เชื่อเพลิง: item.fuel_type,
          สถานะ: item.car_status,
          สี: item.color,
          เกียร์: item.gear,
          รหัสรถ: item.no_car,
          ราคา: item.price,
          ผ่อน: item.ins_price,
          url: item.public_url,
          youtube: item.youtube,
          รถปี: item.years_car,
        }));

        const response = {
          success: true,
          summary: `พบรถที่ตรงกับความต้องการของคุณ ${result.data.length} คันค่ะ`,
          query: args, // ✅ This should contain {"lte": {"price": 500000}}
          count: result.data.length,
          rawData: referenceData,
          isQuery: true,
        };

        console.log("[carHandlers] Returning response with query:", {
          query: response.query,
          count: response.count,
          isQuery: response.isQuery,
        });

        return response;
      } else {
        return {
          success: false,
          summary: "น้องไม่พบข้อมูลลองคลิ๊กที่ปุ่มเพื่อดูรถเลยอีกครั้งนะคะ",
          query: args, // ✅ Even on failure, include the query
          count: 0,
          preview: [],
          isQuery: true,
        };
      }
    } catch (error) {
      console.error("Error fetching car data:", error);
      return {
        success: false,
        summary:
          "เกิดข้อผิดพลาดในการดึงข้อมูลรถยนต์ กรุณาลองใหม่อีกครั้งหรือติดต่อเจ้าหน้าที่",
        query: args, // ✅ Include query even on error
        error: error.message,
        count: 0,
        isQuery: true,
      };
    }
  },
};

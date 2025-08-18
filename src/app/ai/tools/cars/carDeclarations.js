// Extract ONLY the definition from your existing carQueryTool.js
export const carDeclarations = [
  {
    name: "queryCarsComprehensive",
    description:
      "This is the PRIMARY and ONLY tool for fetching ALL car listing information...",
    parameters: {
      type: "OBJECT",
      properties: {
        search: {
          type: "ARRAY",
          description:
            "search conditions for car properties. ชื่อสินค้าหรือชื่อรถ : title, ยี่ห้อรถหรือแบรนด์ : brand_name, รุ่นรถ : model_name, ประเภทรถ : car_type_title, สาขา : branch_name. **avoid 'car_type' use 'car_type_title' instead",
          items: {
            type: "OBJECT",
            properties: {
              column: {
                type: "STRING",
                description: "The column to search, e.g. 'brand_name', 'color'",
              },
              query: {
                type: "STRING",
                description:
                  "The value to search for in the column, e.g. 'toyota', 'black'",
              },
            },
            required: [],
          },
        },
        filters: {
          type: "OBJECT",
          description:
            "this prop call 'query.eq()' on supabase Exact match filters for car properties. IMPORTANT: Use 'car_type_title' for car types, NOT 'car_type'.",
          properties: {
            fuel_type: {
              type: "STRING",
              description: "เชื้อเพลิง (Fuel_type), e.g. 'เบนซิน,ดีเซล'",
            },
            car_status: {
              type: "STRING",
              description:
                "สถานะรถ (Car status), e.g. 'กำลังเข้า,วางขาย,เข้าใหม่,จอง,ขายแล้ว'",
            },
            car_type_title: {
              type: "STRING",
              description:
                "ประเภทรถ (Car type), e.g. 'รถเก๋ง,รถกระบะ,SUV,กระบะแคป' - ALWAYS use this for car type filters, NEVER use 'car_type'",
            },
            color: {
              type: "STRING",
              description: "สีรถ (Car color), e.g. 'ขาว,ดำ,แดง, etc...'",
            },
            gear: {
              type: "STRING",
              description: "เกียร์ (Gear), e.g. 'ออโต้,ธรรมดา'",
            },
            no_car: {
              type: "STRING",
              description:
                "**uppercase first** หมายเลขหรือรหัสรถ : no_car eg. หารถที่มีรหัส D19 (Find a car with ID D19), ค้นหารถรหัส J057 (Search for car ID J057), ดูรถหมายเลข B-199 (Show car number B-199) '",
            },
          },
          required: [],
        },
        lte: {
          type: "OBJECT",
          description:
            "this prop call 'query.lte()' on supabase Less-than-or-equal-to (LTE) filters for numerical properties.",
          properties: {
            price: {
              type: "NUMBER",
              description: "ราคา (Price) - Maximum, e.g. 500000",
            },
            ins_price: {
              type: "NUMBER",
              description: "ผ่อน (Installment price) - Maximum, e.g. 6700",
            },
          },
          required: [],
        },
        gte: {
          type: "OBJECT",
          description:
            "this prop call 'query.gte()' on supabase Greater-than-or-equal-to (GTE) filters for numerical properties.",
          properties: {
            price: {
              type: "NUMBER",
              description: "ราคา (Price) - Minimum, e.g. 100000",
            },
            ins_price: {
              type: "NUMBER",
              description: "ผ่อน (Installment price) - Minimum, e.g. 5000",
            },
          },
          required: [],
        },
        limit: {
          type: "NUMBER",
          description:
            "this prop call 'query.limit' on supabase Limit number of results",
        },
        total: {
          type: "OBJECT",
          description: "Options for returning car total/count information. ",
          properties: {
            count: {
              type: "STRING",
              description:
                "Set to 'exact' to request the exact total count of cars. หรือ ขอให้หารถแบบไม่ระบุเจาะจงมากนัก",
              enum: ["exact"],
            },
            head: {
              type: "BOOLEAN",
              description:
                "Set to true to request only the header/summary (no details).",
            },
          },
          required: [],
        },
      },
      required: [],
    },
  },
];

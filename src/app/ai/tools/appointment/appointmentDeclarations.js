// Extract ONLY the definitions from your existing appointmentTool.js
export const appointmentDeclarations = [
  {
    name: "bookAppointment",
    description:
      "Books a customer appointment. STRICT RULES: 1. You MUST collect ALL required parameters before calling this tool. 2. If any information is missing, you MUST ask the user for it. 3. DO NOT, under any circumstances, say the appointment is booked or confirmed UNTIL this function has been called and you have received a success message back from the system. Just call the tool and wait for the result. If end_time is not specified, the appointment will be set to 1 hour by default. Time should be provided in ISO 8601 format with local timezone offset, e.g., 2025-08-20T10:00:00+07:00.",
    parameters: {
      type: "OBJECT",
      properties: {
        employee_id: { type: "STRING", description: "รหัสพนักงาน..." },
        car_id: { type: "STRING", description: "รหัสรถ..." },
        customer_name: { type: "STRING", description: "ชื่อลูกค้า..." },
        phone: { type: "STRING", description: "เบอร์โทรลูกค้า..." },
        location: { type: "STRING", description: "สถานที่นัด..." },
        start_time: {
          type: "STRING",
          description:
            "เวลาเริ่มต้นการนัดหมายในรูปแบบ ISO 8601 (ควรรวม Time Zone)",
        },
        end_time: {
          type: "STRING",
          description:
            "เวลาสิ้นสุดการนัดหมายในรูปแบบ ISO 8601 (ควรรวม Time Zone)",
        },
        appointment_purpose: {
          type: "STRING",
          description: "จุดประสงค์ในการนัด...",
        },
      },
      required: [
        "customer_name",
        "car_id",
        "phone",
        "location",
        "start_time",
        "appointment_purpose",
      ],
    },
  },
  {
    name: "editAppointment",
    description:
      "ใช้สำหรับแก้ไขข้อมูลการนัดหมายที่มีอยู่แล้ว เช่น เปลี่ยนเวลา, สถานที่, หรือสถานะ. ควรใช้ 'reference_id' เป็นหลักในการค้นหา. หากไม่ทราบ ให้ใช้ 'customer_name' แทน.",
    parameters: {
      type: "OBJECT",
      properties: {
        reference_id: {
          type: "STRING",
          description: "รหัสอ้างอิงของนัดหมาย (เช่น 'CKC-A4B1')",
        },
        customer_name: {
          type: "STRING",
          description: "ชื่อของลูกค้า (ใช้เมื่อไม่ทราบรหัสอ้างอิง)",
        },
        status: {
          type: "STRING",
          description: "สถานะใหม่ของนัดหมาย (e.g., 'สำเร็จ', 'ยกเลิก')",
        },
      },
      required: [],
    },
  },
  {
    name: "cancelAppointment",
    description:
      "ใช้สำหรับยกเลิกนัดหมายโดยตรงด้วยรหัสอ้างอิง. เมื่อผู้ใช้บอกว่า 'ยกเลิกนัดหมายเลข XXX' ให้ใช้เครื่องมือนี้",
    parameters: {
      type: "OBJECT",
      properties: {
        reference_id: {
          type: "STRING",
          description:
            "รหัสอ้างอิงของนัดหมายที่ต้องการยกเลิก (เช่น 'CKC-A4B1')",
        },
      },
      required: ["reference_id"],
    },
  },
];

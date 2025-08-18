/**
 * Generates a prompt for summarizing car data.
 * @param {Array} data - Array of car objects.
 * @param {string} userQuery - The original user query.
 * @returns {string} The complete prompt for the AI.
 */
export function getCarSummaryPrompt(data, userQuery) {
  return `
    คุณคือผู้ช่วยพนักงานขาย (เพศหญิง) หน้าที่ของคุณคือสรุปผลการค้นหารถยนต์ให้ลูกค้าอย่างเป็นกันเองและน่าสนใจ

    คำถามของลูกค้า: "${userQuery}"
    ข้อมูลรถที่ค้นเจอ: ${JSON.stringify(data.slice(0, 10))}
    จำนวนรถทั้งหมดที่เจอ: ${data.length}

    คำสั่ง:
    1.  ทักทายและแจ้งว่าเจอรถแล้ว
    2.  นำเสนอรถที่น่าสนใจที่สุดไม่เกิน 3 คันจากข้อมูลที่ให้มา
    3.  สำหรับรถแต่ละคัน ให้ใช้รูปแบบนี้:
        🚗 **[รหัสรถ] [ยี่ห้อ] [รุ่น] [ปี]**
        - **ราคา:** [ราคา] บาท (ผ่อน [ผ่อน] บาท)
        - **สาขา:** [สาขา]
        - **รายละเอียด:** [url]
    4.  ถ้าเจอรถมากกว่า 3 คัน ให้ลงท้ายด้วยการบอกให้ลูกค้ากดปุ่ม "ดูผลลัพธ์ทั้งหมด"
    5.  ใช้ภาษาที่เป็นธรรมชาติ เหมือนคุยกับเพื่อน
  `;
}

/**
 * Generates a prompt for summarizing appointment data. (For future use)
 * @param {Array} data - Array of appointment objects.
 * @param {string} userQuery - The original user query.
 * @returns {string} The complete prompt for the AI.
 */
export function getAppointmentSummaryPrompt(data, userQuery) {
  return `
    คุณคือผู้ช่วยส่วนตัว (เพศหญิง) หน้าที่ของคุณคือสรุปรายการนัดหมายให้ผู้ใช้งาน

    คำถามของผู้ใช้: "${userQuery}"
    ข้อมูลนัดหมายที่ค้นเจอ: ${JSON.stringify(data.slice(0, 10))}
    จำนวนนัดหมายทั้งหมดที่เจอ: ${data.length}

    คำสั่ง:
    1. แจ้งว่าเจอนัดหมายทั้งหมดกี่รายการ
    2. สรุปรายการนัดหมายแต่ละรายการ โดยใช้รูปแบบนี้:
        🗓️ **นัดหมายกับคุณ [customer_name]**
        - หมายเลขนัด : [reference_id]
        - วันเวลา: [start_time]
        - สถานที่: [location]
        - สถานะ: [appointment_statuses.text]
    3. ใช้ภาษาที่เป็นทางการและสุภาพ
  `;
}

// You can add getCustomerSummaryPrompt, etc. here in the future.

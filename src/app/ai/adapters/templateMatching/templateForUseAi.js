/**
 * ✅ NEW: Determine if message is about cars or pricing (should use AI)
 */
export function isCarOrPriceRelated(messageContent) {
  if (!messageContent || typeof messageContent !== "string") {
    return false;
  }

  const message = messageContent.toLowerCase().trim();

  // ✅ Car-related keywords (Thai and English)
  const carKeywords = [
    // Thai car terms
    "รถ",
    "กระบะ",
    "เก๋ง",
    "suv",
    "ปิกอัพ",
    "ฮอนด้า",
    "โตโยต้า",
    "มาสด้า",
    "นิสสัน",
    "ฟอร์ด",
    "แคมรี่",
    "อัลติส",
    "ซีวิค",
    "แอคคอร์ด",
    "ฟอร์จูนเนอร์",

    // English car terms
    "honda",
    "toyota",
    "mazda",
    "nissan",
    "ford",
    "camry",
    "altis",
    "civic",
    "accord",
    "fortuner",
    "car",
    "vehicle",
    "auto",
    "sedan",
    "pickup",
  ];

  // ✅ Inquiry keywords (show interest/asking)
  const inquiryKeywords = [
    // Thai inquiry terms
    "มี",
    "มีไหม",
    "สนใจ",
    "อยาก",
    "ต้องการ",
    "แนะนำ",
    "หา",
    "ดู",
    "เลือก",
    "ปรึกษา",
    "แอด",
    "แอดมิน",
    "โทร",
    "ติดต่อ",
    // English inquiry terms
    "have",
    "want",
    "need",
    "looking",
    "recommend",
    "suggest",
    "help",
    "tell",
    "show",
    "find",
  ];

  // ✅ Check for car-related content
  const hasCarKeyword = carKeywords.some((keyword) =>
    message.includes(keyword)
  );
  // ✅ Determine if should use AI
  const shouldUseAI = hasCarKeyword;

  console.log("[Car/Price Analysis]", {
    messagePreview: message.substring(0, 30) + "...",
    hasCarKeyword,
    shouldUseAI,
    matchedPatterns: {
      car: carKeywords.filter((k) => message.includes(k)),
      inquiry: inquiryKeywords.filter((k) => message.includes(k)),
    },
  });

  return shouldUseAI;
}

/**
 * ✅ NEW: Enhanced car/price detection with context awareness
 */
export function isCarOrPriceRelatedAdvanced(
  messageContent,
  previousMessages = []
) {
  const basicCheck = isCarOrPriceRelated(messageContent);

  // ✅ If basic check is true, return immediately
  if (basicCheck) {
    return true;
  }

  // ✅ Check context from previous messages
  if (previousMessages && previousMessages.length > 0) {
    const recentMessages = previousMessages.slice(-3); // Last 3 messages
    const conversationContext = recentMessages
      .map((msg) => msg.content)
      .join(" ")
      .toLowerCase();

    // ✅ If recent conversation was about cars/prices, current message might be follow-up
    const hasCarContext = isCarOrPriceRelated(conversationContext);

    if (hasCarContext) {
      // ✅ Check if current message is likely a follow-up
      const followUpKeywords = [
        "สี",
        "สีไหน",
        "สีอะไร",
        "ขาว",
        "ดำ",
        "เงิน",
        "แดง",
        "ปี",
        "ปีไหน",
        "ปีอะไร",
        "ใหม่",
        "เก่า",
        "โมเดล",
        "ระยะทาง",
        "กิโล",
        "km",
        "เลข",
        "เลขไมล์",
        "สภาพ",
        "เครื่อง",
        "เกียร์",
        "อัตโนมัติ",
        "ธรรมดา",
        "ใช่",
        "ไม่ใช่",
        "แล้ว",
        "ครับ",
        "ค่ะ",
        "จ้า",
        "color",
        "year",
        "model",
        "condition",
        "auto",
        "manual",
      ];

      const hasFollowUp = followUpKeywords.some((keyword) =>
        messageContent.toLowerCase().includes(keyword)
      );

      console.log("[Advanced Car/Price Analysis]", {
        basicCheck,
        hasCarContext,
        hasFollowUp,
        shouldUseAI: hasFollowUp,
        contextPreview: conversationContext.substring(0, 50) + "...",
      });

      return hasFollowUp;
    }
  }

  return false;
}

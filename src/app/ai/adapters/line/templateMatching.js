/**
 * ✅ Template Matching Service for Manual Mode
 * Analyzes user messages and suggests appropriate template responses
 */

export class TemplateMatchingService {
  constructor() {
    // ✅ Define keyword patterns for each template type
    this.keywordPatterns = {
      greeting: [
        // Thai greetings
        "สวัสดี",
        "หวัดดี",
        "ดีครับ",
        "ดีค่ะ",
        "ดีคะ",
        "ดีจ้า",
        "ไง",
        "วันดี",
        "ตอนดี",
        "เช้าดี",
        "บ่ายดี",
        "เย็นดี",
        // English greetings
        "hello",
        "hi",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
        // Common Thai conversation starters
        "เฮ้ย",
        "ว่าไง",
        "ไง",
        "มีไหม",
        "อยู่ไหม",
      ],

      carInquiry: [
        // Car-related keywords
        "รถ",
        "คาร์",
        "car",
        "อยาก",
        "สนใจ",
        "ดู",
        "เห็น",
        "มี",
        "รุ่น",
        "ยี่ห้อ",
        "โตโยต้า",
        "ฮอนด้า",
        "มาสด้า",
        "นิสสัน",
        "เบนซ์",
        "บีเอ็มดับบลิว",
        "ออดี้",
        "โฟล์ค",
        "ฟอร์ด",
        "honda",
        "toyota",
        "mazda",
        "nissan",
        "bmw",
        "benz",
        "audi",
        "มือสอง",
        "ใหม่",
        "ป้าย",
        "แดง",
        "เก่า",
        "used",
        "new",
        "ซื้อ",
        "หา",
        "ต้องการ",
        "want",
        "buy",
        "looking",
        "ประหยัด",
        "เก๋ง",
        "กระบะ",
        "suv",
        "รถยนต์",
        "vehicle",
      ],

      pricing: [
        // Price-related keywords
        "ราคา",
        "เงิน",
        "บาท",
        "price",
        "cost",
        "money",
        "แพง",
        "ถูก",
        "expensive",
        "cheap",
        "affordable",
        "ผ่อน",
        "ดาวน์",
        "down",
        "payment",
        "installment",
        "เครดิต",
        "ไฟแนนซ์",
        "สินเชื่อ",
        "loan",
        "finance",
        "เท่าไหร่",
        "เท่าไร",
        "how much",
        "กี่บาท",
        "ค่า",
        "จ่าย",
        "pay",
        "โปรโมชั่น",
        "ลด",
        "discount",
        "promotion",
        "งบ",
        "budget",
        "ออกรถ",
        "จอง",
        "booking",
      ],

      contact: [
        // Contact-related keywords
        "ติดต่อ",
        "โทร",
        "call",
        "phone",
        "contact",
        "เบอร์",
        "number",
        "tel",
        "line",
        "ไลน์",
        "คุย",
        "talk",
        "พูด",
        "speak",
        "discuss",
        "นัด",
        "หมาย",
        "เจอ",
        "meet",
        "appointment",
        "มา",
        "ไป",
        "come",
        "visit",
        "ดู",
        "ชม",
        "โชว์รูม",
        "showroom",
        "สาขา",
        "branch",
        "ที่อยู่",
        "address",
        "location",
        "where",
        "เวลา",
        "time",
        "ว่าง",
        "free",
        "available",
      ],
    };

    // ✅ Confidence thresholds
    this.confidenceThresholds = {
      high: 0.7,
      medium: 0.4,
      low: 0.2,
    };
  }

  /**
   * ✅ Analyze message and find the best matching template
   */
  analyzeMessage(message, templates) {
    console.log("[TemplateMatching] Analyzing message:", {
      messageLength: message.length,
      firstWords: message.substring(0, 50) + "...",
    });

    const normalizedMessage = this.normalizeText(message);
    const results = {};

    // Calculate scores for each template type
    for (const [templateType, keywords] of Object.entries(
      this.keywordPatterns
    )) {
      const score = this.calculateMatchScore(normalizedMessage, keywords);
      results[templateType] = {
        score,
        confidence: this.getConfidenceLevel(score),
        template: templates[templateType] || null,
      };
    }

    // Find the best match
    const bestMatch = this.getBestMatch(results);

    console.log("[TemplateMatching] Analysis results:", {
      bestMatch: bestMatch.type,
      confidence: bestMatch.confidence,
      score: bestMatch.score,
      allScores: Object.fromEntries(
        Object.entries(results).map(([type, result]) => [type, result.score])
      ),
    });

    return {
      bestMatch,
      allMatches: results,
      suggestion: this.createSuggestion(bestMatch, message),
    };
  }

  /**
   * ✅ Normalize text for better matching
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, "") // Keep Thai, English, numbers, spaces
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * ✅ Calculate match score for a template type
   */
  calculateMatchScore(message, keywords) {
    let totalScore = 0;
    let matchedKeywords = 0;

    for (const keyword of keywords) {
      const normalizedKeyword = keyword.toLowerCase();

      // Exact match gets higher score
      if (message.includes(normalizedKeyword)) {
        const frequency = (
          message.match(new RegExp(normalizedKeyword, "g")) || []
        ).length;
        totalScore += frequency * 2; // Weight for exact matches
        matchedKeywords++;
      }

      // Partial match gets lower score
      else if (message.includes(normalizedKeyword.substring(0, 3))) {
        totalScore += 0.5;
      }
    }

    // Normalize score based on message length and keyword count
    const messageWords = message.split(" ").length;
    const keywordDensity = matchedKeywords / keywords.length;
    const messageDensity = matchedKeywords / messageWords;

    return Math.min(
      1.0,
      (totalScore / messageWords) * keywordDensity * messageDensity * 10
    );
  }

  /**
   * ✅ Get confidence level from score
   */
  getConfidenceLevel(score) {
    if (score >= this.confidenceThresholds.high) return "high";
    if (score >= this.confidenceThresholds.medium) return "medium";
    if (score >= this.confidenceThresholds.low) return "low";
    return "none";
  }

  /**
   * ✅ Find the best matching template
   */
  getBestMatch(results) {
    let bestType = "greeting"; // Default fallback
    let bestScore = 0;

    for (const [type, result] of Object.entries(results)) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestType = type;
      }
    }

    return {
      type: bestType,
      score: bestScore,
      confidence: results[bestType].confidence,
      template: results[bestType].template,
    };
  }

  /**
   * ✅ Create suggestion with context
   */
  createSuggestion(bestMatch, originalMessage) {
    const suggestions = {
      high: {
        greeting: "ลูกค้าทักทาย - แนะนำใช้คำทักทายกลับและถามความต้องการ",
        carInquiry: "ลูกค้าสนใจรถ - แนะนำถามรายละเอียดเพิ่มเติมหรือแนะนำรุ่นรถ",
        pricing: "ลูกค้าถามราคา - แนะนำถามงบประมาณและข้อมูลการติดต่อ",
        contact: "ลูกค้าต้องการติดต่อ - แนะนำให้ข้อมูลการติดต่อและนัดหมาย",
      },
      medium: {
        greeting: "อาจเป็นการทักทาย - พิจารณาใช้คำทักทายเป็นมิตร",
        carInquiry: "อาจสนใจรถ - พิจารณาถามความต้องการเบื้องต้น",
        pricing: "อาจถามราคา - พิจารณาให้ข้อมูลราคาเบื้องต้น",
        contact: "อาจต้องการติดต่อ - พิจารณาให้ข้อมูลการติดต่อ",
      },
      low: {
        greeting: "ความเป็นไปได้ต่ำที่เป็นการทักทาย",
        carInquiry: "ความเป็นไปได้ต่ำที่สนใจรถ",
        pricing: "ความเป็นไปได้ต่ำที่ถามราคา",
        contact: "ความเป็นไปได้ต่ำที่ต้องการติดต่อ",
      },
    };

    return {
      message:
        suggestions[bestMatch.confidence]?.[bestMatch.type] ||
        "ไม่พบรูปแบบที่ชัดเจน - แนะนำใช้การตอบกลับทั่วไป",
      recommendedTemplate: bestMatch.template,
      confidence: bestMatch.confidence,
      shouldUseTemplate:
        bestMatch.confidence !== "none" && bestMatch.score > 0.1,
    };
  }

  /**
   * ✅ Get multiple template suggestions for admin UI
   */
  getTemplateSuggestions(message, templates, limit = 3) {
    const analysis = this.analyzeMessage(message, templates);

    // Sort all matches by score
    const sortedMatches = Object.entries(analysis.allMatches)
      .map(([type, result]) => ({ type, ...result }))
      .filter((match) => match.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      message: message,
      suggestions: sortedMatches.map((match) => ({
        type: match.type,
        template: match.template,
        score: match.score,
        confidence: match.confidence,
        label: this.getTemplateLabel(match.type),
      })),
      bestMatch: analysis.bestMatch,
      recommendation: analysis.suggestion,
    };
  }

  /**
   * ✅ Get user-friendly template labels
   */
  getTemplateLabel(type) {
    const labels = {
      greeting: "🙏 ทักทาย",
      carInquiry: "🚗 สอบถามรถ",
      pricing: "💰 ถามราคา",
      contact: "📞 ติดต่อ",
    };
    return labels[type] || type;
  }
}

// ✅ Export singleton instance
export const templateMatchingService = new TemplateMatchingService();

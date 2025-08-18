/**
 * Static Keywords Configuration
 */
const KEYWORDS = {
  critical: [
    "ด่วน",
    "urgent",
    "เร่งด่วน",
    "สำคัญ",
    "important",
    "ฉุกเฉิน",
    "emergency",
    "รีบ",
    "rush",
  ],
  business: [
    "ซื้อ",
    "buy",
    "purchase",
    "จอง",
    "book",
    "reserve",
    "สนใจ",
    "interested",
    "จริงจัง",
    "serious",
    "เช่า",
    "lease",
  ],
  appointments: [
    "นัดหมาย",
    "appointment",
    "ยกเลิก",
    "cancel",
    "แก้ไข",
    "edit",
    "เปลี่ยน",
    "change",
    "โอน",
    "transfer",
    "ดู",
    "view",
    "เช็ค",
    "check",
  ],
  contact: [
    "โทร",
    "phone",
    "call",
    "เบอร์",
    "number",
    "ติดต่อ",
    "contact",
    "คุย",
    "talk",
    "line",
    "facebook",
  ],
  contextDependent: [
    "ที่เราคุยกัน",
    "เมื่อกี้",
    "เมื่อไหร่",
    "อันไหน",
    "อะไรบ้าง",
    "ย้อนกลับ",
    "กลับไป",
    "เหมือนเดิม",
    "อันเก่า",
    "เดิม",
    "ก่อนหน้า",
  ],
  financial: [
    "ราคา",
    "price",
    "เงิน",
    "money",
    "บาท",
    "ผ่อน",
    "ดาวน์",
    "down",
    "เครดิต",
    "credit",
    "สินเชื่อ",
  ],
};

/**
 * Priority Rules
 */
const PRIORITY_RULES = [
  { categories: ["critical"], priority: "high", alwaysSave: true },
  { categories: ["appointments"], priority: "high", alwaysSave: true },
  { categories: ["business", "contact"], priority: "high", alwaysSave: true },
  {
    categories: ["business", "financial"],
    priority: "medium",
    alwaysSave: true,
  },
  { categories: ["contact"], priority: "medium", alwaysSave: false },
  {
    categories: ["contextDependent"],
    priority: "low",
    alwaysSave: false,
    needsHistory: true,
  },
];

export class ImportantKeywordsService {
  constructor() {
    this.keywords = { ...KEYWORDS };
    this.priorityRules = [...PRIORITY_RULES];
  }

  /**
   * 🎯 CORE: Analyze message
   */
  analyzeMessage(text) {
    const lowerText = text.toLowerCase();
    const analysis = {
      categories: {},
      matchedKeywords: [],
      priority: "low",
      shouldSave: false,
      needsHistory: false,
      confidence: 0,
    };

    // Check keywords
    Object.entries(this.keywords).forEach(([category, words]) => {
      const matched = words.filter((keyword) =>
        lowerText.includes(keyword.toLowerCase())
      );
      if (matched.length > 0) {
        analysis.categories[category] = matched;
        analysis.matchedKeywords.push({ category, keywords: matched });
        analysis.confidence += matched.length * 0.1;
      }
    });

    // Apply rules
    this.priorityRules.forEach((rule) => {
      const hasAllCategories = rule.categories.every(
        (cat) => analysis.categories[cat] && analysis.categories[cat].length > 0
      );

      if (hasAllCategories) {
        if (
          this.getPriorityLevel(rule.priority) >
          this.getPriorityLevel(analysis.priority)
        ) {
          analysis.priority = rule.priority;
        }
        if (rule.alwaysSave) analysis.shouldSave = true;
        if (rule.needsHistory) analysis.needsHistory = true;
      }
    });

    analysis.confidence = Math.min(analysis.confidence, 1.0);
    return analysis;
  }

  /**
   * 🎯 CORE: Should save to database
   */
  shouldSaveToDatabase(text, response) {
    const analysis = this.analyzeMessage(text);

    if (analysis.shouldSave) {
      console.log(`[Keywords] Save - Priority: ${analysis.priority}`);
      return true;
    }

    if (
      response?.type === "flex" ||
      (response?.text &&
        (response.text.includes("นัดหมาย") ||
          response.text.includes("appointment")))
    ) {
      console.log(`[Keywords] Save - Important response`);
      return true;
    }

    return false;
  }

  /**
   * 🎯 CORE: Needs conversation history
   */
  needsHistory(text) {
    const analysis = this.analyzeMessage(text);

    if (analysis.needsHistory) {
      console.log(`[Keywords] Needs history`);
      return true;
    }

    const contextHints = [
      /คุณพูดว่า/i,
      /ที่บอก/i,
      /ที่แนะนำ/i,
      /เรื่องเมื่อกี้/i,
    ];
    if (contextHints.some((pattern) => pattern.test(text))) {
      console.log(`[Keywords] Context pattern match`);
      return true;
    }

    return false;
  }

  /**
   * 🔧 UTILS: Get all keywords
   */
  getAllKeywords() {
    return {
      keywords: this.keywords,
      priorityRules: this.priorityRules,
      totalKeywords: Object.values(this.keywords).flat().length,
      totalCategories: Object.keys(this.keywords).length,
    };
  }

  /**
   * 🔧 UTILS: Add keywords (simple)
   */
  addKeywords(category, newKeywords) {
    if (!this.keywords[category]) this.keywords[category] = [];
    const unique = newKeywords.filter(
      (k) => !this.keywords[category].includes(k)
    );
    this.keywords[category].push(...unique);
    return unique;
  }

  /**
   * 🔧 UTILS: Remove keywords (simple)
   */
  removeKeywords(category, keywordsToRemove) {
    if (!this.keywords[category]) return [];
    const before = this.keywords[category].length;
    this.keywords[category] = this.keywords[category].filter(
      (k) => !keywordsToRemove.includes(k)
    );
    return before - this.keywords[category].length;
  }

  /**
   * Helper methods
   */
  getPriorityLevel(priority) {
    const levels = { low: 1, medium: 2, high: 3 };
    return levels[priority] || 0;
  }
}

// Export singleton
export const importantKeywords = new ImportantKeywordsService();

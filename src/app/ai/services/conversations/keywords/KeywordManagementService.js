import { importantKeywords } from "../coversation/keywords/ImportantKeywordsService.js";

export class KeywordManagementService {
  constructor() {
    this.keywordService = importantKeywords;
  }

  /**
   * 📊 Get detailed statistics
   */
  getDetailedStats() {
    const basic = this.keywordService.getAllKeywords();
    const stats = {
      ...basic,
      categories: {},
      distribution: {},
    };

    Object.entries(basic.keywords).forEach(([category, words]) => {
      stats.categories[category] = {
        count: words.length,
        keywords: words,
        percentage: Math.round((words.length / basic.totalKeywords) * 100),
      };
    });

    // Priority distribution
    const priorities = { high: 0, medium: 0, low: 0 };
    basic.priorityRules.forEach((rule) => {
      priorities[rule.priority] += rule.categories.length;
    });
    stats.distribution = priorities;

    return stats;
  }

  /**
   * 🔍 Advanced search
   */
  searchKeywords(searchTerm, options = {}) {
    const { category, exactMatch = false } = options;
    const results = {};
    const lowerSearchTerm = searchTerm.toLowerCase();

    const categoriesToSearch = category
      ? [category]
      : Object.keys(this.keywordService.keywords);

    categoriesToSearch.forEach((cat) => {
      if (!this.keywordService.keywords[cat]) return;

      const matches = this.keywordService.keywords[cat].filter((keyword) => {
        const lowerKeyword = keyword.toLowerCase();
        return exactMatch
          ? lowerKeyword === lowerSearchTerm
          : lowerKeyword.includes(lowerSearchTerm);
      });

      if (matches.length > 0) {
        results[cat] = matches;
      }
    });

    return {
      searchTerm,
      exactMatch,
      category: category || "all",
      results,
      totalMatches: Object.values(results).flat().length,
    };
  }

  /**
   * 🏗️ Bulk operations
   */
  bulkAddKeywords(operations) {
    const results = [];

    operations.forEach((op) => {
      try {
        const added = this.keywordService.addKeywords(op.category, op.keywords);
        results.push({
          category: op.category,
          success: true,
          added: added.length,
          keywords: added,
        });
      } catch (error) {
        results.push({
          category: op.category,
          success: false,
          error: error.message,
        });
      }
    });

    return {
      operations: operations.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * 📝 Create category with validation
   */
  createCategoryAdvanced(categoryName, keywords = [], options = {}) {
    const {
      priority = "medium",
      alwaysSave = false,
      needsHistory = false,
    } = options;

    // Validate category name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(categoryName)) {
      throw new Error(
        "Invalid category name. Use letters, numbers, and underscores only."
      );
    }

    if (this.keywordService.keywords[categoryName]) {
      throw new Error(`Category ${categoryName} already exists`);
    }

    // Create category
    this.keywordService.keywords[categoryName] = [...keywords];

    // Add priority rule if specified
    if (priority !== "medium" || alwaysSave || needsHistory) {
      this.keywordService.priorityRules.push({
        categories: [categoryName],
        priority,
        alwaysSave,
        needsHistory,
      });
    }

    return {
      category: categoryName,
      keywordCount: keywords.length,
      priority,
      alwaysSave,
      needsHistory,
    };
  }

  /**
   * 🧪 Test keyword effectiveness
   */
  testKeywords(testTexts) {
    const results = [];

    testTexts.forEach((text) => {
      const analysis = this.keywordService.analyzeMessage(text);
      results.push({
        text: text.substring(0, 50) + "...",
        priority: analysis.priority,
        shouldSave: analysis.shouldSave,
        needsHistory: analysis.needsHistory,
        matchedCategories: Object.keys(analysis.categories),
        confidence: Math.round(analysis.confidence * 100) + "%",
      });
    });

    return {
      totalTests: testTexts.length,
      highPriority: results.filter((r) => r.priority === "high").length,
      willSave: results.filter((r) => r.shouldSave).length,
      needHistory: results.filter((r) => r.needsHistory).length,
      results,
    };
  }

  /**
   * 📈 Performance analytics
   */
  getAnalytics(timeframe = "24h") {
    // This would integrate with actual usage data
    return {
      timeframe,
      keywordHits: {
        critical: 12,
        business: 45,
        appointments: 23,
        contact: 18,
        financial: 31,
      },
      savingsRate: "78%",
      accuracy: "94%",
      topKeywords: [
        { keyword: "ซื้อ", hits: 15, category: "business" },
        { keyword: "นัดหมาย", hits: 12, category: "appointments" },
        { keyword: "ราคา", hits: 10, category: "financial" },
      ],
    };
  }
}

// Export singleton
export const keywordManager = new KeywordManagementService();

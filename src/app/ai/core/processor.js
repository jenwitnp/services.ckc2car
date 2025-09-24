import { GoogleGenerativeAI } from "@google/generative-ai";
import { tools } from "@/app/ai/tools";
import { getSystemPrompt } from "./prompts";
import { formatMessagesForGemini } from "./formatters";
import {
  getAppointmentSummaryPrompt,
  getCarSummaryPrompt,
} from "./summaryPrompt";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Core AI processing function - platform agnostic
 */

// This should now be defined and valid
if (!GEMINI_API_KEY) {
  throw new Error("GOOGLE_GEMINI_API_KEY is not defined");
}

// 1. Initialize with the correct class from the new package
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function processAIRequest(
  messages,
  context = {},
  platform = "web",
  config = {}
) {
  try {
    // 2. Get the generative model with tools and system instructions
    const model = genAI.getGenerativeModel({
      model: config.model || GEMINI_MODEL, // Using a modern model
      tools: tools,
      systemInstruction: getSystemPrompt(context, platform),
    });

    // 3. Format messages
    const formattedMessages = formatMessagesForGemini(messages, context);

    console.log(
      `[AI Core] Starting chat with ${formattedMessages.length} messages.`
    );

    // 4. Start a chat session and send the message history
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1), // Send all but the last message as history
    });

    const lastMessage = formattedMessages[formattedMessages.length - 1];
    // --- NEW: Retry logic for API calls ---
    const MAX_RETRIES = 3;
    let result;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[AI Core] Attempt ${attempt} to send message...`);
        result = await chat.sendMessage(lastMessage.parts[0].text);
        lastError = null; // Clear last error on success
        break; // Exit loop if successful
      } catch (error) {
        lastError = error;
        // Check if it's a retryable error (like 503)
        if (error.message && error.message.includes("503")) {
          if (attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
            console.warn(
              `[AI Core] Model overloaded (503). Retrying in ${delay}ms...`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } else {
          // If it's a different error (e.g., 400 Bad Request), throw immediately.
          throw error;
        }
      }
    }

    // If all retries failed, throw the last captured error to be handled by the adapter.
    if (lastError) {
      console.error(`[AI Core] All retries failed. Final error:`, lastError);
      throw lastError;
    }
    // --- END RETRY LOGIC ---

    // Process the response
    const response = result.response;
    const functionCalls = response.functionCalls();

    // Handle function calls if present
    if (functionCalls && functionCalls.length > 0) {
      const functionCall = functionCalls[0];
      console.log(`[AI Core] Function call detected: ${functionCall.name}`);
      return {
        type: "function_call",
        functionName: functionCall.name,
        args: functionCall.args,
        rawResponse: response.text() || "",
      };
    }

    // Return text response
    return {
      type: "text",
      content: response.text() || "",
    };
  } catch (error) {
    console.error(`[AI Core] Error processing request:`, error);
    // Provide more detailed error for debugging
    const errorMessage = error.details || error.message;
    return {
      type: "error",
      error: errorMessage,
    };
  }
}

/**
 * A generic function to summarize different types of data using the AI.
 * @param {Array} data - The array of data objects (e.g., cars, appointments).
 * @param {string} originalUserQuery - The user's original question.
 * @param {string} summaryType - The type of data to summarize ('cars', 'appointments', etc.).
 * @returns {Promise<string>} - A natural language summary.
 */
export async function summarizeData(data, originalUserQuery, summaryType) {
  // console.log("[summary data] : ", data);
  if (!data || data.length === 0) {
    return "ขออภัยค่ะ ไม่พบข้อมูลที่ตรงกับความต้องการของคุณเลย";
  }

  if (!GEMINI_API_KEY) {
    throw new Error("GOOGLE_GEMINI_API_KEY is not defined");
  }

  let summaryPrompt;

  // Select the appropriate prompt based on the summary type
  switch (summaryType) {
    case "cars":
      summaryPrompt = getCarSummaryPrompt(data, originalUserQuery);
      break;
    case "appointments":
      summaryPrompt = getAppointmentSummaryPrompt(data, originalUserQuery);
      break;
    // Add more cases for 'customers', etc. in the future
    default:
      console.error(`Unknown summary type: ${summaryType}`);
      return "ขออภัยค่ะ ไม่สามารถสรุปข้อมูลประเภทนี้ได้";
  }

  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  try {
    const result = await model.generateContent(summaryPrompt);
    return result.response.text();
  } catch (error) {
    console.error(`Error summarizing ${summaryType} data:`, error);
    return "ขออภัยค่ะ เกิดข้อผิดพลาดในการสรุปข้อมูล";
  }
}

export class AIProcessor {
  constructor() {
    if (!GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not defined");
    }
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  /**
   * Analyze customer provinces from Thai messages
   */
  async analyzeCustomerProvinces(messages) {
    try {
      if (!messages || messages.length === 0) {
        return {
          provinces: [],
          analysis: "ไม่มีข้อมูลข้อความเพื่อวิเคราะห์",
          totalAnalyzed: 0,
        };
      }

      // Sample messages to reduce AI cost
      const sampleMessages = this.sampleMessages(messages, 50); // Further reduced for testing

      console.log(
        `[AIProcessor] Analyzing ${sampleMessages.length} messages for provinces`
      );

      const prompt = `
วิเคราะห์ข้อความของลูกค้าต่อไปนี้ และหาจังหวัดที่ลูกค้าอาจมาจาก:

${sampleMessages
  .map(
    (msg, index) =>
      `${index + 1}. ลูกค้า ${msg.username || msg.userId}: "${msg.content}"`
  )
  .slice(0, 30) // Show only first 30 for prompt
  .join("\n")}

กรุณาระบุจังหวัดที่พบในข้อความและตอบเป็น JSON:
{
  "provinces": [
    {
      "name": "ชื่อจังหวัด",
      "mentions": 1,
      "confidence": 8
    }
  ],
  "topProvinces": ["จังหวัดที่พบมากที่สุด"],
  "analysis": "สรุปการวิเคราะห์",
  "totalAnalyzed": ${sampleMessages.length}
}

หมายเหตุ: มองหาคำใบ้เช่น "ที่กรุงเทพ", "มาจากเชียงใหม่", "อยู่ที่ภูเก็ต" เป็นต้น
      `;

      const response = await this.callGemini(prompt);
      const cleanedResponse = this.extractJsonFromResponse(response);
      const result = JSON.parse(cleanedResponse);

      return {
        ...result,
        analyzedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[AIProcessor] Province analysis error:", error);
      return {
        provinces: [],
        analysis: `เกิดข้อผิดพลาดในการวิเคราะห์จังหวัด: ${error.message}`,
        error: error.message,
        totalAnalyzed: messages.length,
      };
    }
  }

  /**
   * Analyze car interests from Thai messages
   */
  async analyzeCarInterests(messages) {
    try {
      if (!messages || messages.length === 0) {
        return this.getEmptyCarAnalysis();
      }

      // Filter messages that likely contain car-related content
      const carRelatedMessages = messages.filter((msg) =>
        this.containsCarKeywords(msg.content)
      );

      console.log(
        `[AIProcessor] Found ${carRelatedMessages.length} car-related messages out of ${messages.length}`
      );

      if (carRelatedMessages.length === 0) {
        return this.getEmptyCarAnalysis();
      }

      // Sample for cost efficiency
      const sampleMessages = this.sampleMessages(carRelatedMessages, 30);

      const prompt = `
วิเคราะห์ข้อความของลูกค้าเกี่ยวกับรถยนต์ต่อไปนี้ และระบุแบรนด์ รุ่น และความต้องการของลูกค้า:

${sampleMessages
  .map(
    (msg, index) =>
      `${index + 1}. ลูกค้า ${msg.username || msg.userId}: "${msg.content}"`
  )
  .join("\n")}

⚠️ หมายเหตุสำคัญ:
- ให้ความสำคัญกับการสะกดแบรนด์รถที่หลากหลาย เช่น "นิสัน" = "Nissan", "ฮอนด้า" = "Honda"
- มองหาคำที่เกี่ยวกับการซื้อขาย เช่น "ขาย", "ซื้อ", "หา", "ต้องการ"
- ระบุทั้งรถใหม่และรถมือสอง


กรุณาวิเคราะห์และตอบเป็น JSON:
{
  "carBrands": [
    {
      "brand": "Nissan", 
      "mentions": 1,
      "popularity": 8,
      "examples": ["นิสัน"],
      "variations": ["นิสัน", "nissan"]
    }
  ],
  "carModels": [
    {
      "model": "ระบุรุ่นที่พบ",
      "brand": "Nissan",
      "mentions": 1,
      "yearMentioned": [],
      "contexts": ["ขาย", "มือสอง"]
    }
  ],
  "carTypes": [
    {
      "type": "รถเก๋ง",
      "mentions": 1,
      "brands": ["Honda", "Toyota"]
    }
  ],
  "serviceTypes": [
    {
      "service": "ขายรถมือสอง",
      "mentions": 1,
      "urgency": "ปกติ",
      "relatedBrands": ["Nissan"]
    }
  ],
  "commonIssues": [
    {
      "issue": "ปัญหาเครื่องยนต์",
      "frequency": 1,
      "affectedModels": ["Civic", "Vios"],
      "symptoms": ["เครื่องดับ", "สั่น"]
    }
  ],
  "customerNeeds": [
    {
      "need": "ซื้อรถมือสอง Nissan",
      "frequency": 1,
      "timePreference": []
    }
  ],
  "insights": {
    "topBrand": "Honda",
    "topModel": "Civic", 
    "topService": "ซ่อมเครื่อง",
    "urgentRequests": 0,
    "repeatCustomers": 0
  },
  "analysis": "ลูกค้าส่วนใหญ่ใช้รถ Honda Civic และมีปัญหาเครื่องยนต์ ต้องการซ่อมด่วน",
  "totalAnalyzed": ${sampleMessages.length}
}

หมายเหตุ: 
- ดูรายละเอียดในข้อความเช่น ปี รุ่น สี ประเภทรถ
- จับความต้องการเร่งด่วน เช่น "ด่วน" "วันนี้" "รีบ"
- แยกแยะระหว่างรถยนต์ส่วนบุคคล รถกระบะ รถ SUV
- หาปัญหาซ้ำที่เกิดกับรถรุ่นเดียวกัน
`;
      const response = await this.callGemini(prompt);
      const cleanedResponse = this.extractJsonFromResponse(response);

      let result;
      try {
        result = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("[AIProcessor] JSON Parse Error:", parseError);
        return this.getEmptyCarAnalysis("เกิดข้อผิดพลาดในการแปลงข้อมูล JSON");
      }

      // ✅ Ensure all required fields exist
      return {
        carBrands: result.carBrands || [],
        carModels: result.carModels || [],
        carTypes: result.carTypes || [],
        serviceTypes: result.serviceTypes || [],
        commonIssues: result.commonIssues || [],
        customerNeeds: result.customerNeeds || [],
        insights: {
          topBrand: result.insights?.topBrand || "ไม่ระบุ",
          topModel: result.insights?.topModel || "ไม่ระบุ",
          topService: result.insights?.topService || "ไม่ระบุ",
          urgentRequests: result.insights?.urgentRequests || 0,
          repeatCustomers: result.insights?.repeatCustomers || 0,
          ...result.insights,
        },
        analysis: result.analysis || "ไม่สามารถวิเคราะห์ข้อมูลได้",
        totalAnalyzed: result.totalAnalyzed || sampleMessages.length,
        analyzedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[AIProcessor] Car interest analysis error:", error);
      return this.getEmptyCarAnalysis(error.message);
    }
  }

  /**
   * Helper: Get empty car analysis structure
   */
  getEmptyCarAnalysis(errorMessage = "ไม่มีข้อมูลข้อความเพื่อวิเคราะห์") {
    return {
      carBrands: [],
      carModels: [],
      carTypes: [],
      serviceTypes: [],
      commonIssues: [],
      customerNeeds: [],
      insights: {
        topBrand: "ไม่ระบุ",
        topModel: "ไม่ระบุ",
        topService: "ไม่ระบุ",
        urgentRequests: 0,
        repeatCustomers: 0,
      },
      analysis: errorMessage,
      totalAnalyzed: 0,
      analyzedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate comprehensive business insights
   */
  async generateBusinessInsights(analyticsData) {
    try {
      const prompt = `
วิเคราะห์ข้อมูลธุรกิจ CKC Car Services ต่อไปนี้และให้คำแนะนำ:

ข้อมูลลูกค้า:
- ลูกค้าทั้งหมด: ${analyticsData.customers.totalUniqueCustomers} คน
- ลูกค้าใหม่: ${analyticsData.customers.newCustomers} คน (ใน ${
        analyticsData.timeRange
      } วันที่ผ่านมา)
- ลูกค้าที่มี username: ${analyticsData.customers.customersWithUsername} คน

ข้อมูลข้อความ:
- ข้อความทั้งหมด: ${analyticsData.messages.totalMessages} ข้อความ
- ข้อความจากลูกค้า: ${analyticsData.messages.userMessages} ข้อความ
- การตอบกลับ: ${analyticsData.messages.botResponses} ข้อความ
- ผู้ใช้งาน active: ${analyticsData.messages.activeUsers} คน
${
  analyticsData.messages.adminMessages
    ? `- ข้อความจากแอดมิน: ${analyticsData.messages.adminMessages} ข้อความ`
    : ""
}

ข้อมูลการสนทนา:
- บทสนทนาทั้งหมด: ${analyticsData.conversations.totalConversations} บทสนทนา
- ข้อความทั้งหมด: ${analyticsData.conversations.totalMessages} ข้อความ

โปรดให้คำแนะนำเป็นภาษาไทยในรูปแบบ JSON:
{
  "summary": "สรุปสถิติสำคัญ",
  "trends": {
    "customerGrowth": "การเติบโตของลูกค้า",
    "engagement": "ระดับการมีส่วนร่วม"
  },
  "strengths": ["จุดแข็งของธุรกิจ"]
}
      `;

      const response = await this.callGemini(prompt);
      const cleanedResponse = this.extractJsonFromResponse(response);
      const result = JSON.parse(cleanedResponse);

      return {
        ...result,
        generatedAt: new Date().toISOString(),
        dataRange: `${analyticsData.timeRange} วันที่ผ่านมา`,
      };
    } catch (error) {
      console.error("[AIProcessor] Business insights error:", error);
      return {
        summary: `เกิดข้อผิดพลาดในการสร้างสรุป: ${error.message}`,
        error: error.message,
        generatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Process and categorize car analysis results
   */
  procesCarAnalysisResults(rawResults) {
    try {
      // ✅ Process car brands with additional insights
      const processedBrands =
        rawResults.carBrands?.map((brand) => ({
          ...brand,
          marketShare: this.calculateMarketShare(
            brand.mentions,
            rawResults.totalAnalyzed
          ),
          category: this.categorizeBrand(brand.brand),
        })) || [];

      // ✅ Process car models with generation info
      const processedModels =
        rawResults.carModels?.map((model) => ({
          ...model,
          generation: this.inferGeneration(model.model, model.yearMentioned),
          segment: this.categorizeModel(model.model),
        })) || [];

      // ✅ Process service urgency
      const processedServices =
        rawResults.serviceTypes?.map((service) => ({
          ...service,
          priority: this.calculateServicePriority(
            service.urgency,
            service.mentions
          ),
          estimatedRevenue: this.estimateServiceRevenue(service.service),
        })) || [];

      return {
        ...rawResults,
        carBrands: processedBrands,
        carModels: processedModels,
        serviceTypes: processedServices,
        businessInsights: {
          topRevenueBrand: this.findTopRevenueBrand(processedBrands),
          urgentServiceCount: this.countUrgentServices(processedServices),
          repeatCustomerIndicators: this.findRepeatCustomers(rawResults),
          marketTrends: this.analyzeTrends(processedBrands, processedModels),
        },
      };
    } catch (error) {
      console.error("[AIProcessor] Error processing car analysis:", error);
      return rawResults; // Return original if processing fails
    }
  }

  /**
   * Helper methods for car data processing
   */
  calculateMarketShare(mentions, total) {
    return total > 0 ? Math.round((mentions / total) * 100) : 0;
  }

  categorizeBrand(brand) {
    const luxuryBrands = ["BMW", "Mercedes", "Audi", "Lexus"];
    const japaneseEconomy = ["Toyota", "Honda", "Nissan", "Mazda"];
    const pickupSpecialists = ["Isuzu", "Ford", "Mitsubishi"];

    if (luxuryBrands.includes(brand)) return "Luxury";
    if (japaneseEconomy.includes(brand)) return "Japanese Economy";
    if (pickupSpecialists.includes(brand)) return "Pickup/Commercial";
    return "Others";
  }

  categorizeModel(model) {
    const sedans = ["Vios", "City", "Altis", "Camry", "Accord"];
    const hatchbacks = ["Yaris", "Jazz", "March"];
    const pickups = ["Hilux", "Ranger", "Triton", "Navara", "D-Max"];
    const suvs = ["Fortuner", "Everest", "Pajero"];

    if (sedans.some((s) => model.toLowerCase().includes(s.toLowerCase())))
      return "Sedan";
    if (hatchbacks.some((h) => model.toLowerCase().includes(h.toLowerCase())))
      return "Hatchback";
    if (pickups.some((p) => model.toLowerCase().includes(p.toLowerCase())))
      return "Pickup";
    if (suvs.some((s) => model.toLowerCase().includes(s.toLowerCase())))
      return "SUV";
    return "Others";
  }

  calculateServicePriority(urgency, mentions) {
    const urgencyScore = {
      สูง: 3,
      กลาง: 2,
      ต่ำ: 1,
      ปกติ: 1,
    };

    const baseScore = urgencyScore[urgency] || 1;
    const mentionMultiplier = Math.min(mentions / 5, 2); // Cap at 2x

    return Math.round(baseScore * mentionMultiplier);
  }

  estimateServiceRevenue(service) {
    // Estimated revenue in THB
    const serviceRates = {
      ซ่อมเครื่อง: 3000,
      เปลี่ยนยาง: 2000,
      เช็คระบบ: 800,
      เปลี่ยนน้ำมัน: 1200,
      ซ่อมแอร์: 2500,
      ซ่อมเบรค: 3500,
    };

    return serviceRates[service] || 1500; // Default 1500 THB
  }

  /**
   * Enhanced car keyword detection with fuzzy matching
   */
  containsCarKeywords(content) {
    // ✅ First, try exact keyword matching
    if (this.exactCarKeywordMatch(content)) {
      return true;
    }

    // ✅ Then try fuzzy matching for Thai brands
    return this.fuzzyCarBrandMatch(content);
  }

  /**
   * Exact keyword matching (existing method)
   */
  exactCarKeywordMatch(content) {
    const carKeywords = [
      // ✅ Popular Thai car brands (with variations)
      "toyota",
      "โตโยต้า",
      "ถอนดา",
      "โตโยต้",
      "ถอยต้า",
      "honda",
      "ฮอนด้า",
      "ฮอลด้า",
      "ฮอนดา",
      "ฮอนด้",
      "nissan",
      "นิสสัน",
      "นิสัน",
      "นิสแซ่น",
      "นิสซาน", // ✅ Added variations
      "mazda",
      "มาสด้า",
      "มาซด้า",
      "มาสดา",
      "isuzu",
      "อีซูซุ",
      "อิซูซุ",
      "อีซูซู",
      "mitsubishi",
      "มิตซู",
      "มิตซูบิชิ",
      "มิตซูบิชี",
      "มิตซุ",
      "ford",
      "ฟอร์ด",
      "ฟอด",
      "ฟอร์ต",
      "chevrolet",
      "เชฟโรเลต",
      "เชฟโรเล็ต",
      "เชฟ",
      "bmw",
      "บีเอ็มดับเบิลยู",
      "บีเอ็มดับบลิว",
      "บีเอ็ม",
      "benz",
      "เบนซ์",
      "เบนส์",
      "เบ้นซ์",
      "mercedes",
      "เมอร์เซเดส",
      "audi",
      "เอาดี้",
      "เอาดี",
      "อาวดี้",
      "lexus",
      "เล็กซัส",
      "เล็กซัส",
      "เลกซัส",
      "hyundai",
      "ฮุนได",
      "ฮันได",
      "ฮุนไดต์",
      "kia",
      "เกีย",
      "เกียา",
      "เกีย่า",
      "mg",
      "เอ็มจี",
      "เอมจี",

      // ✅ Popular models in Thailand (with variations)
      "vios",
      "วีออส",
      "วีออษ",
      "วีอส",
      "yaris",
      "ยาริส",
      "ยาริท",
      "ยาลิส",
      "camry",
      "แคมรี",
      "แคมรี่",
      "แคมริ",
      "altis",
      "อัลติส",
      "อัลทิส",
      "อลติส",
      "civic",
      "ซีวิค",
      "ซีวิก",
      "ซิวิค",
      "ซิวิก",
      "city",
      "ซิตี้",
      "ซิตี้",
      "ซิตี",
      "accord",
      "แอคคอร์ด",
      "แอคคอด",
      "อคคอร์ด",
      "jazz",
      "แจซ",
      "แจส",
      "แจ๊ส",
      "freed",
      "ฟรีด",
      "ฟรี้ด",
      "fortuner",
      "ฟอร์จูนเนอร์",
      "ฟอจูนเนอร์",
      "ฟอร์จูเนอร์",
      "hilux",
      "ไฮลักซ์",
      "ไฮลัก",
      "ไฮลักษ์",
      "ranger",
      "เรนเจอร์",
      "เรนเจอ",
      "เรนเจอ์",
      "everest",
      "เอเวอเรสต์",
      "เอเวอเรส",
      "เอเวอร์เรสต์",
      "triton",
      "ไตรทัน",
      "ไตรตัน",
      "ไทรทัน",
      "navara",
      "นาวารา",
      "นาวาร่า",
      "นาวาล่า",
      "d-max",
      "ดีแม็กซ์",
      "ดีแม็ก",
      "ดีแมกซ์",
      "ดีแมก",
      "bt-50",
      "บีที-50",
      "บีที50",
      "บีที ห้าสิบ",

      // ✅ Car types in Thai
      "รถ",
      "คาร์",
      "car",
      "auto",
      "รถเก๋ง",
      "รถกระบะ",
      "รถบรรทุก",
      "รถตู้",
      "รถ suv",
      "รถยนต์",
      "รถยน",
      "รถปิคอัพ",
      "รถสี่ประตู",
      "รถสองประตู",

      // ✅ Service keywords
      "ซ่อม",
      "เช็ค",
      "ตรวจ",
      "เปลี่ยน",
      "ขาย",
      "ซื้อ", // ✅ Added ขาย, ซื้อ
      "service",
      "maintenance",
      "บำรุงรักษา",
      "ปรับ",
      "แก้",
      "ทำ",
      "ดู",
      "ช่วย",

      // ✅ Car parts in Thai
      "เครื่อง",
      "เครื่องยนต์",
      "ระบบ",
      "เบรค",
      "เบรก",
      "แอร์",
      "แอร์คอน",
      "ล้อ",
      "ยาง",
      "น้ำมัน",
      "แบตเตอรี่",
      "แบต",
      "เกียร์",
      "คลัช",
      "โช๊ค",
      "ไฟหน้า",
      "ไฟท้าย",
      "กระจก",
      "กันชน",
      "ประตู",
      "หลังคา",
      "เสียง",
      "สั่น",
      "ดับ",
      "ติด",

      // ✅ Problem indicators
      "เสีย",
      "พัง",
      "ไม่ทำงาน",
      "ปัญหา",
      "แปลก",
      "ผิดปกติ",
      "เสียงดัง",
      "ร้อน",
      "ร่วง",
      "หลุด",
      "รั่ว",
    ];

    const lowerContent = content.toLowerCase();
    return carKeywords.some((keyword) =>
      lowerContent.includes(keyword.toLowerCase())
    );
  }

  /**
   * Fuzzy matching for Thai car brands
   */
  fuzzyCarBrandMatch(content) {
    const thaiCarBrands = [
      { variations: ["นิสัน", "นิสสัน", "nissan"], brand: "Nissan" },
      { variations: ["ฮอนด้า", "ฮอนดา", "honda"], brand: "Honda" },
      { variations: ["โตโยต้า", "โตโยต้", "toyota"], brand: "Toyota" },
      { variations: ["มาสด้า", "มาซด้า", "mazda"], brand: "Mazda" },
      { variations: ["อีซูซุ", "อิซูซุ", "isuzu"], brand: "Isuzu" },
      { variations: ["ฟอร์ด", "ฟอด", "ford"], brand: "Ford" },
      { variations: ["เบนซ์", "เบนส์", "benz", "mercedes"], brand: "Mercedes" },
    ];

    const lowerContent = content.toLowerCase();

    return thaiCarBrands.some((brandData) =>
      brandData.variations.some((variation) =>
        lowerContent.includes(variation.toLowerCase())
      )
    );
  }

  /**
   * Helper: Sample messages for cost efficiency
   */
  sampleMessages(messages, maxCount) {
    if (messages.length <= maxCount) {
      return messages;
    }

    // Take a representative sample: recent messages + random sampling
    const recent = messages.slice(0, Math.floor(maxCount * 0.6));
    const remaining = messages.slice(Math.floor(maxCount * 0.6));
    const randomSample = remaining
      .sort(() => 0.5 - Math.random())
      .slice(0, maxCount - recent.length);

    return [...recent, ...randomSample];
  }

  /**
   * Helper: Call Gemini AI with better error handling
   */
  async callGemini(prompt) {
    try {
      console.log(
        `[AIProcessor] Calling Gemini AI... prompt length: ${prompt.length}`
      );

      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.1, // Lower temperature for more consistent JSON
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(
        `[AIProcessor] Gemini response received, length: ${text.length}`
      );
      return text;
    } catch (error) {
      console.error(`[AIProcessor] Gemini AI call failed:`, error);
      throw error;
    }
  }

  /**
   * Helper: Extract JSON from response with better error handling
   */
  extractJsonFromResponse(response) {
    try {
      // Remove markdown code blocks if present
      let cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "");

      // Try to find JSON in the response - more robust regex
      const jsonMatch = cleaned.match(/\{[\s\S]*?\}(?=\s*$)/);
      if (jsonMatch) {
        return jsonMatch[0];
      }

      // Try to find any JSON object
      const anyJsonMatch = cleaned.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
      if (anyJsonMatch) {
        return anyJsonMatch[0];
      }

      // If no JSON found, try to create a simple response
      return `{
        "summary": "${cleaned.replace(/"/g, '\\"')}",
        "error": "Could not parse AI response as JSON"
      }`;
    } catch (error) {
      console.error("[AIProcessor] Error extracting JSON:", error);
      return `{
        "summary": "เกิดข้อผิดพลาดในการแปลงข้อมูล",
        "error": "${error.message}"
      }`;
    }
  }
}

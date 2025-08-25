# 📊 CKC Car Services - Analytics API Manual

> **Endpoint:** `/api/v1/line/messages-customers-count`  
> **Description:** LINE customer message analytics with AI-powered insights  
> **Version:** 1.0  
> **Last Updated:** August 26, 2025

---

## 🎯 **Overview**

This API provides comprehensive analytics for LINE customer interactions including:

- Customer statistics and growth metrics
- Message analysis and engagement rates
- AI-powered insights (provinces, car interests, business recommendations)
- Real-time caching for performance optimization

## 📡 **API Endpoints**

### **GET Request - Analytics Data**

```http
GET /api/v1/line/messages-customers-count
```

### **POST Request - Cache Management**

```http
POST /api/v1/line/messages-customers-count
```

---

## 🔧 **GET Parameters**

| Parameter        | Type    | Default | Description                             |
| ---------------- | ------- | ------- | --------------------------------------- |
| `timeRange`      | integer | `30`    | Number of days to analyze (1-365)       |
| `includeSummary` | boolean | `false` | Include AI analysis in response         |
| `includeAllTime` | boolean | `false` | Include total customer count (all time) |
| `forceRefresh`   | boolean | `false` | Bypass cache and regenerate AI analysis |

### **Examples:**

```bash
# Basic analytics (30 days)
GET /api/v1/line/messages-customers-count

# Last 7 days with AI analysis
GET /api/v1/line/messages-customers-count?timeRange=7&includeSummary=true

# Full analytics with total customers
GET /api/v1/line/messages-customers-count?timeRange=14&includeAllTime=true&includeSummary=true

# Force refresh cache
GET /api/v1/line/messages-customers-count?timeRange=7&includeSummary=true&forceRefresh=true
```

---

## 📊 **Response Structure**

### **Basic Response (without AI)**

```json
{
  "timeRange": 7,
  "period": {
    "startDate": "2025-08-18T18:14:17.374Z",
    "endDate": "2025-08-25T18:14:17.374Z",
    "days": 7
  },
  "customers": {
    "totalUniqueCustomers": 15,
    "newCustomers": 3,
    "customersWithUsername": 12,
    "dataPoints": 145
  },
  "messages": {
    "totalMessages": 145,
    "userMessages": 98,
    "botResponses": 42,
    "adminMessages": 5,
    "textMessages": 140,
    "mediaMessages": 5,
    "activeUsers": 15,
    "activeAdmins": 2,
    "avgMessageLength": 45,
    "recentConversations": 145
  },
  "conversations": {
    "totalConversations": 15,
    "totalMessages": 145,
    "conversationsWithSummary": 0,
    "totalUserMessages": 98,
    "platformBreakdown": {
      "line": 145
    },
    "timeRange": 7
  },
  "generatedAt": "2025-08-26T04:14:17.423Z",
  "fromCache": false
}
```

### **Enhanced Response (with includeAllTime=true)**

```json
{
  // ... basic response fields ...
  "totalCustomers": {
    "totalCustomersAllTime": 85,
    "customersWithUsernameAllTime": 65,
    "totalDataPoints": 450,
    "dataRange": {
      "earliest": "2024-06-01T00:00:00.000Z",
      "latest": "2025-08-26T10:00:00.000Z",
      "totalDays": 451
    }
  },
  "growth": {
    "newCustomersInPeriod": 3,
    "totalCustomersAllTime": 85,
    "growthPercentage": 3.53,
    "growthDescription": "เพิ่มขึ้น 3.53% ใน 7 วันที่ผ่านมา"
  }
}
```

### **AI Analysis Response (with includeSummary=true)**

```json
{
  // ... basic response fields ...
  "aiAnalysis": {
    "provinces": {
      "provinces": [
        {
          "name": "กรุงเทพมหานคร",
          "mentions": 8,
          "confidence": 9,
          "evidence": ["อยู่ที่กรุงเทพ", "ใน กทม."]
        },
        {
          "name": "เชียงใหม่",
          "mentions": 3,
          "confidence": 7,
          "evidence": ["มาจากเชียงใหม่", "ป้ายเชียงใหม่"]
        }
      ],
      "topProvinces": ["กรุงเทพมหานคร", "เชียงใหม่", "ชลบุรี"],
      "analysis": "ลูกค้าส่วนใหญ่มาจากกรุงเทพมหานคร ตามด้วยเชียงใหม่และจังหวัดใกล้เคียง",
      "totalAnalyzed": 50,
      "analyzedAt": "2025-08-26T04:14:20.123Z"
    },
    "carInterests": {
      "carBrands": [
        {
          "brand": "Honda",
          "mentions": 12,
          "popularity": 9
        },
        {
          "brand": "Toyota",
          "mentions": 8,
          "popularity": 8
        }
      ],
      "carModels": [
        {
          "model": "Civic",
          "brand": "Honda",
          "mentions": 6
        },
        {
          "model": "City",
          "brand": "Honda",
          "mentions": 4
        }
      ],
      "serviceTypes": [
        {
          "service": "ซ่อมเครื่อง",
          "mentions": 15
        },
        {
          "service": "เปลี่ยนยาง",
          "mentions": 8
        }
      ],
      "commonIssues": [
        {
          "issue": "ปัญหาเครื่องยนต์",
          "frequency": 10
        },
        {
          "issue": "ระบบแอร์เสีย",
          "frequency": 6
        }
      ],
      "insights": {
        "topBrand": "Honda",
        "topService": "ซ่อมเครื่อง"
      },
      "analysis": "ลูกค้าส่วนใหญ่ใช้รถ Honda โดยเฉพาะ Civic และต้องการบริการซ่อมเครื่องยนต์",
      "totalAnalyzed": 30,
      "analyzedAt": "2025-08-26T04:14:22.456Z"
    },
    "insights": {
      "summary": "ธุรกิจมีการเติบโตดี ลูกค้าใหม่เพิ่มขึ้นต่อเนื่อง การตอบสนองลูกค้าอยู่ในระดับดี",
      "trends": {
        "customerGrowth": "ลูกค้าใหม่เพิ่มขึ้น 3.53% ในสัปดาห์ที่ผ่านมา",
        "engagement": "อัตราการตอบกลับอยู่ที่ 42.9% ซึ่งอยู่ในระดับดี",
        "customerRetention": "ลูกค้าส่วนใหญ่กลับมาใช้บริการซ้ำ"
      },
      "strengths": [
        "การตอบสนองลูกค้าเร็ว",
        "ความหลากหลายของบริการ",
        "ลูกค้าประจำจำนวนมาก"
      ],
      "improvements": [
        {
          "area": "การจัดการข้อมูลลูกค้า",
          "recommendation": "ควรเก็บข้อมูลลูกค้าให้ครบถ้วนมากขึ้น"
        },
        {
          "area": "การวิเคราะห์ปัญหา",
          "recommendation": "ควรจัดหมวดหมู่ปัญหาเพื่อวิเคราะห์แนวโน้ม"
        }
      ],
      "actionItems": [
        {
          "action": "พัฒนาระบบเก็บข้อมูลลูกค้า",
          "timeline": "1-2 เดือน"
        },
        {
          "action": "สร้างระบบติดตามปัญหาซ้ำ",
          "timeline": "2-3 เดือน"
        }
      ],
      "generatedAt": "2025-08-26T04:14:25.789Z",
      "dataRange": "7 วันที่ผ่านมา"
    },
    "analysisGeneratedAt": "2025-08-26T04:14:25.789Z",
    "fromCache": false
  }
}
```

---

## 🔄 **POST Requests - Cache Management**

### **Get Cache Statistics**

```bash
POST /api/v1/line/messages-customers-count
Content-Type: application/json

{
  "action": "getCacheStats"
}
```

**Response:**

```json
{
  "totalEntries": 3,
  "entries": [
    {
      "key": "analytics:7:true:98",
      "createdAt": "2025-08-26T04:10:15.123Z",
      "expiresAt": "2025-08-26T04:40:15.123Z",
      "isExpired": false
    }
  ]
}
```

### **Clear Cache**

```bash
POST /api/v1/line/messages-customers-count
Content-Type: application/json

{
  "action": "clearCache"
}
```

**Response:**

```json
{
  "message": "Cleared 3 cache entries",
  "timestamp": "2025-08-26T04:15:30.456Z"
}
```

---

## ⚡ **Performance & Caching**

### **Cache Behavior:**

- **Cache Key:** `analytics:{timeRange}:{includeSummary}:{messageCount}`
- **TTL:** 30 minutes
- **Storage:** In-memory (Map)
- **Auto-expire:** Yes

### **Response Times:**

- **First Request (no cache):** 30-40 seconds (with AI analysis)
- **Cached Request:** 1-2 seconds
- **Basic Analytics:** 2-5 seconds

### **Cache Indicators:**

```json
{
  "fromCache": true,
  "aiAnalysis": {
    "fromCache": true,
    "lastGenerated": "2025-08-26T04:10:15.123Z"
  }
}
```

---

## 🚫 **Error Responses**

### **Authentication Error (401)**

```json
{
  "error": "Unauthorized",
  "timestamp": "2025-08-26T04:15:30.456Z"
}
```

### **Database Error (500)**

```json
{
  "error": "Internal server error",
  "message": "Failed to fetch conversation data",
  "timestamp": "2025-08-26T04:15:30.456Z"
}
```

### **AI Analysis Error (Partial Success)**

```json
{
  // ... successful basic data ...
  "aiAnalysis": {
    "error": "AI analysis failed: Rate limit exceeded",
    "analysisGeneratedAt": "2025-08-26T04:15:30.456Z",
    "fromCache": false
  }
}
```

---

## 📋 **Data Sources**

### **Database Table:** `line_admin_conversations`

**Key Fields:**

- `line_user_id` - Unique customer identifier
- `line_username` - Customer display name
- `message_role` - Role: `user`, `assistant`, `admin`
- `message_content` - Message text content
- `message_type` - Type: `text`, `image`, `audio`, etc.
- `created_at` - Message timestamp
- `platform` - Platform: `line`
- `metadata` - Additional data (JSON)

---

## 🤖 **AI Analysis Details**

### **Province Analysis:**

- **Input:** Thai customer messages
- **Output:** Geographic distribution
- **Keywords:** Location mentions, license plates, regional terms
- **Model:** Gemini 1.5 Flash
- **Sample Size:** Up to 50 messages

### **Car Interest Analysis:**

- **Input:** Car-related messages
- **Output:** Brand preferences, service needs
- **Keywords:** Car brands, models, service types
- **Model:** Gemini 1.5 Flash
- **Sample Size:** Up to 30 car-related messages

### **Business Insights:**

- **Input:** All analytics data
- **Output:** Trends, recommendations, action items
- **Model:** Gemini 1.5 Flash
- **Language:** Thai

---

## 🔐 **Security & Authentication**

### **Authentication:**

- **Method:** NextAuth.js session
- **Required:** Yes (currently disabled for testing)
- **Session Check:** Server-side validation

### **Rate Limiting:**

- **AI Calls:** Limited by Gemini API quotas
- **Cache:** Reduces AI API calls
- **Recommendation:** Use cache-friendly parameters

---

## 🛠️ **Configuration**

### **Environment Variables:**

```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

### **AI Model Settings:**

```javascript
{
  model: "gemini-1.5-flash",
  temperature: 0.1,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 2048
}
```

### **Cache Settings:**

```javascript
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
```

---

## 📝 **Usage Examples**

### **1. Daily Dashboard (Quick Overview)**

```bash
GET /api/v1/line/messages-customers-count?timeRange=1
```

### **2. Weekly Report with AI**

```bash
GET /api/v1/line/messages-customers-count?timeRange=7&includeSummary=true&includeAllTime=true
```

### **3. Monthly Analysis**

```bash
GET /api/v1/line/messages-customers-count?timeRange=30&includeSummary=true&includeAllTime=true
```

### **4. Force Fresh Data**

```bash
GET /api/v1/line/messages-customers-count?timeRange=7&includeSummary=true&forceRefresh=true
```

### **5. Cache Management**

```bash
# Check cache
POST /api/v1/line/messages-customers-count
{"action": "getCacheStats"}

# Clear cache
POST /api/v1/line/messages-customers-count
{"action": "clearCache"}
```

---

## 🚀 **Best Practices**

### **Performance Optimization:**

1. Use `includeAllTime=false` for frequent requests
2. Cache AI analysis results for repeated queries
3. Use appropriate time ranges (7-30 days for most cases)
4. Clear cache when data significantly changes

### **AI Analysis:**

1. Use `includeSummary=true` only when needed
2. Monitor AI API quotas and costs
3. Use `forceRefresh=true` sparingly
4. Consider batch processing for multiple reports

### **Error Handling:**

1. Always check for `error` fields in response
2. Handle partial failures gracefully
3. Implement retry logic for transient errors
4. Monitor cache hit rates

---

## 📊 **Sample Integration**

### **React Dashboard Component:**

```javascript
const useAnalytics = (timeRange = 7, includeSummary = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/v1/line/messages-customers-count?timeRange=${timeRange}&includeSummary=${includeSummary}&includeAllTime=true`
        );
        const result = await response.json();

        if (result.error) {
          throw new Error(result.message);
        }

        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, includeSummary]);

  return { data, loading, error };
};
```

---

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **Slow Response Times**

   - Check if AI analysis is needed
   - Use cached results when possible
   - Reduce time range for testing

2. **AI Analysis Failures**

   - Verify Gemini API key
   - Check API quotas
   - Ensure sufficient message data

3. **Empty Results**

   - Verify date range has data
   - Check database connectivity
   - Confirm field names match table structure

4. **Memory Issues**
   - Clear cache periodically
   - Reduce sample sizes for AI analysis
   - Monitor server memory usage

### **Debug Endpoints:**

```bash
# Basic health check
GET /api/v1/line/messages-customers-count?timeRange=1

# Cache inspection
POST /api/v1/line/messages-customers-count
{"action": "getCacheStats"}
```

---

## 📞 **Support**

- **API Issues:** Check server logs for detailed errors
- **Database Issues:** Verify table structure and permissions
- **AI Issues:** Monitor Gemini API status and quotas
- **Performance Issues:** Review cache usage and optimization

---

**Last Updated:** August 26, 2025  
**Version:** 1.0  
**Maintainer:** CKC Development Team

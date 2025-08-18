import { Client } from "@line/bot-sdk";
import { processLineRequest } from "@/app/ai/adapters/line.js";
import { ContextService } from "@/app/ai/services/context/ContextService.js";
import crypto from "crypto"; // ✅ Fix crypto import

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);
const contextService = new ContextService();

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const events = JSON.parse(body).events;

    // Process each LINE event
    for (const event of events) {
      await handleLineEvent(event);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("LINE webhook error:", error);
    console.error("Error stack:", error.stack); // ✅ Add stack trace
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function handleLineEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const { replyToken, source } = event;
  const userMessage = event.message.text;
  const userId = source.userId;

  try {
    console.log(`[LINE] Message from ${userId}: ${userMessage}`);

    // ✅ Get context and ensure userId is included
    const baseContext = await contextService.getUserContext(userId);
    const context = {
      ...baseContext,
      userId, // ✅ Explicitly add userId
      platform: "line",
    };

    console.log(`[LINE] Context prepared:`, {
      userId: context.userId,
      hasCarModels: !!context.carModels,
      hasBranches: !!context.branches,
      fallback: context.fallback,
    });

    // Process message using AI adapter
    const aiResponse = await processLineRequest(userMessage, context);

    console.log(`[LINE] AI Response type: ${aiResponse.type}`);

    // Reply to user
    await client.replyMessage(replyToken, aiResponse);

    // Save conversation history
    await saveConversationHistory(userId, userMessage, aiResponse);
  } catch (error) {
    console.error("Error handling LINE event:", error);
    console.error("Error stack:", error.stack); // ✅ Add stack trace

    // Send error message to user
    await client.replyMessage(replyToken, {
      type: "text",
      text: "ขออภัยค่ะ เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้งค่ะ",
    });
  }
}

function verifySignature(body, signature) {
  // ✅ Fix crypto usage
  const hash = crypto
    .createHmac("sha256", process.env.LINE_CHANNEL_SECRET)
    .update(body)
    .digest("base64");

  return hash === signature;
}

async function saveConversationHistory(userId, userMessage, aiResponse) {
  try {
    console.log(`[LINE] Saving conversation for user ${userId}`);
    // This is handled by the LINE adapter's conversation services
  } catch (error) {
    console.error("Error saving conversation:", error);
  }
}

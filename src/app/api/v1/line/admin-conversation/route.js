import { NextResponse } from "next/server";
import { validateSignature } from "@line/bot-sdk";
import { LineEventHandler } from "./handlers/LineEventHandler.js";
import { GetRequestHandler } from "./handlers/GetRequestHandler.js";

// LINE Bot configuration
const config = {
  channelAccessToken: process.env.LINE_ADMIN_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_ADMIN_CHANNEL_SECRET,
};

const lineEventHandler = new LineEventHandler(config);

/**
 * ✅ Verify LINE signature
 */
function verifySignature(body, signature) {
  try {
    return validateSignature(
      body,
      process.env.LINE_ADMIN_CHANNEL_SECRET,
      signature
    );
  } catch (error) {
    console.error("LINE signature verification error:", error);
    return false;
  }
}

/**
 * ✅ Handle POST requests (LINE webhooks)
 */
export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!verifySignature(body, signature)) {
      console.error("Invalid LINE signature for admin channel");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const events = JSON.parse(body).events;

    for (const event of events) {
      await lineEventHandler.handleLineEvent(event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LINE webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * ✅ Handle GET requests (API endpoints)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await GetRequestHandler.handleGetRequest(searchParams);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET request error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message === "Invalid action" ? 400 : 500 }
    );
  }
}

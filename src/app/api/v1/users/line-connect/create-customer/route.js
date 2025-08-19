import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { lineUserId, displayName, pictureUrl, userType } =
      await request.json();

    if (!lineUserId) {
      return NextResponse.json(
        { success: false, message: "LINE User ID is required" },
        { status: 400 }
      );
    }

    // Create customer in your database
    const customerData = {
      line_user_id: lineUserId,
      name: displayName || `LINE User ${lineUserId.substring(0, 8)}`,
      image: pictureUrl,
      user_type: userType || "line_customer",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Call your existing API or database service
    const response = await fetch(
      `${process.env.AUTH_URL}/api/user/create-line-customer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Clientid: process.env.CKC_CLIENT_ID,
        },
        body: JSON.stringify(customerData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create customer: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        image: result.user.image,
        userType: "line_customer",
        lineUserId: lineUserId,
      },
    });
  } catch (error) {
    console.error("Error creating LINE customer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create customer account" },
      { status: 500 }
    );
  }
}

import ckc2carService from "@/app/services/ckc2car";

export async function POST(request) {
  try {
    const { userId, lineUserId } = await request.json();

    console.log("Received link userId:", userId);
    console.log("Received link lineUserId:", lineUserId);

    // Validate required parameters
    if (!userId || !lineUserId) {
      return Response.json(
        {
          success: false,
          message:
            "Missing required parameters: userId and lineUserId are required",
        },
        { status: 400 }
      );
    }

    // Call the API to update the user's LINE ID
    const response = await ckc2carService.post("/api/user/updateLineId", {
      user_id: userId,
      line_user_id: lineUserId,
    });

    // Check response status and data
    console.log("Update LINE ID response:", response.status);
    console.log("Update LINE ID data:", response.data);

    if (response.data && response.data.status === "ok") {
      return Response.json(
        {
          success: true,
          message: "LINE account linked successfully",
          data: response.data,
        },
        { status: 200 }
      );
    } else {
      // API returned error or unexpected response
      return Response.json(
        {
          success: false,
          message: response.data?.message || "Failed to link LINE account",
          data: response.data,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error linking LINE account:", error);

    return Response.json(
      {
        success: false,
        message: "Server error while linking LINE account",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

import ckc2carService from "@/app/services/ckc2car";

export async function GET(request, { params }) {
  const { lineUserId } = await params;
  console.log("api getUserByLineId is : ", lineUserId);

  try {
    console.log("Calling checklineid endpoint with:", { lineUserId });

    const response = await ckc2carService.post("/api/user/checklineid", {
      line_user_id: lineUserId,
    });

    console.log("ckc response status:", response.status);
    console.log("ckc response data:", JSON.stringify(response.data, null, 2));

    // FIXED: Check for status: "ok" and data property instead
    if (response.data && response.data.status === "ok" && response.data.data) {
      return Response.json({
        success: true,
        user: response.data.data, // Extract user data from the 'data' property
      });
    } else {
      console.log("No user found with LINE ID:", lineUserId);
      return Response.json(
        {
          success: false,
          message: "No user found with this LINE ID",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error checking LINE user ID:", error);
    return Response.json(
      {
        success: false,
        message: "Error checking LINE user ID",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

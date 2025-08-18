import ckc2carService from "@/app/services/ckc2car";

export async function GET(request, { params }) {
  const { id } = await params;
  console.log("api getUserByUserId is : ", id);

  try {
    console.log("Calling check user id endpoint with:", { id });

    const response = await ckc2carService.post("/api/user/exist", {
      user_id: id,
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
      console.log("No user found with ID:", UserId);
      return Response.json(
        {
          success: false,
          message: "No user found with this ID",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error checking user ID:", error);
    return Response.json(
      {
        success: false,
        message: "Error checking user ID",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

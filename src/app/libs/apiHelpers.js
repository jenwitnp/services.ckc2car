import { NextResponse } from "next/server";

export function handleApiError(error) {
  console.error("[API Error]:", error);

  // Handle specific error types
  if (error.name === "ValidationError") {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: error.message,
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  if (error.name === "DatabaseError") {
    return NextResponse.json(
      {
        success: false,
        error: "Database operation failed",
        code: "DATABASE_ERROR",
      },
      { status: 500 }
    );
  }

  // Generic error
  return NextResponse.json(
    {
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export function createSuccessResponse(data, message = "Success") {
  return NextResponse.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function createErrorResponse(error, status = 400, code = "ERROR") {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

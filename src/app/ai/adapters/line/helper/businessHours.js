// ✅ Add business hours checking function
export function checkBusinessHours(businessHours) {
  const { start, end, timezone } = businessHours;

  // ✅ Handle 24/7 operation (00:00 to 00:00)
  if (start === "00:00" && end === "00:00") {
    console.log("[Business Hours] 24/7 operation detected");
    return true;
  }

  try {
    const now = new Date();
    const currentTime = new Date(
      now.toLocaleString("en-US", { timeZone: timezone })
    );
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    console.log("[Business Hours] Time check:", {
      currentTime: `${currentHour.toString().padStart(2, "0")}:${currentMinute
        .toString()
        .padStart(2, "0")}`,
      businessStart: start,
      businessEnd: end,
      timezone,
    });

    // Handle overnight hours (e.g., 22:00 to 06:00)
    if (startTotalMinutes > endTotalMinutes) {
      return (
        currentTotalMinutes >= startTotalMinutes ||
        currentTotalMinutes < endTotalMinutes
      );
    }

    // Normal hours (e.g., 09:00 to 18:00)
    return (
      currentTotalMinutes >= startTotalMinutes &&
      currentTotalMinutes < endTotalMinutes
    );
  } catch (error) {
    console.error("[Business Hours] Error checking business hours:", error);
    return true; // Default to within hours on error
  }
}

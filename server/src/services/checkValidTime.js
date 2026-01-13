// ✅ Validate if fulfillmentTime aligns with selected timeframe
export const checkValidTime = (fulfillmentTime, timeframe) => {
  try {
    const now = new Date();
    const fulfillment = new Date(fulfillmentTime);

    if (isNaN(fulfillment.getTime())) {
      return false; // ⛔ Invalid date
    }

    const diffInHours = (fulfillment - now) / (1000 * 60 * 60); // Hours diff

    const timeframeMap = {
      "24": 24,         // 1 day
      "7": 7 * 24,      // 7 days
      "1": 30 * 24      // ~1 month
    };

    const allowedHours = timeframeMap[timeframe]; // will be undefined if invalid

    if (!allowedHours) return false;

    // ✅ Must be in future & within the allowed hours
    return diffInHours > 0 && diffInHours <= allowedHours;
    
  } catch (error) {
    console.error("⚠️ checkValidTime error:", error.message);
    return false;
  }
};

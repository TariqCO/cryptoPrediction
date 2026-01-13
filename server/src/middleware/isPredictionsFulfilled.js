import { userModel } from "../models/userModel.js";
import { getCurrentPrice } from "../services/currentPriceOfCoin.js";

export const isfulfilledUsersPredictions = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const user = await userModel.findById(_id);
    if (!user || !user.myPredictions?.length) {
      return res.status(404).json({ error: "User or predictions not found." });
    }

    const now = new Date();
    const results = [];
    let isModified = false;

    for (let prediction of user.myPredictions) {
      const fulfillDate = new Date(prediction.fulfillmentTime);

      // ⏱️ If time passed and still pending → mark as expired
      if (fulfillDate < now && prediction.outcome === "pending") {
        prediction.outcome = "expired";
        isModified = true;
      }

      // ✅ Check current price
      const currentPrice = await getCurrentPrice(prediction.symbol);
      const target = parseFloat(prediction.targetPrice);
      const current = parseFloat(currentPrice);

      let isFulfilled = false;

      // 🎯 Fulfillment logic
      if (
        prediction.direction === "positive" && current >= target ||
        prediction.direction === "negative" && current <= target
      ) {
        isFulfilled = true;
        if (prediction.outcome === "pending") {
          prediction.outcome = "fulfilled";
          prediction.fulfilledAt = new Date(); 
          isModified = true;
        }
      }

      results.push({
        symbol: prediction.symbol,
        targetPrice: prediction.targetPrice,
        slug: prediction.slug,
        isFulfilled,
        direction: prediction.direction,
        createdAt: prediction.createdAt,
        fulfilledAt: prediction.fulfilledAt || null,
        outcome: prediction.outcome || "pending",
        logo: prediction.logo,
        timeframe: prediction.timeframe,
        priceWhenVoting: prediction.priceWhenVoting,
        confidence: prediction.confidence,
      });
    }

    if (isModified) {
      await user.save(); // 💾 Save only when changes made
    }

    req.filledPredictions = results;
    next();
  } catch (error) {
    console.error("❌ Error checking predictions:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

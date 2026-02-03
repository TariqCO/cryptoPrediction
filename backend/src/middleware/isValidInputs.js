import { checkValidPrediction } from "../services/checkValidPrediction.js";
import { getCurrentPrice } from "../services/currentPriceOfCoin.js";

export const isValidInputs = async (req, res, next) => {
  const { prediction, slug, symbol } = req.body;

  try {
    const now = new Date();
    const fulfillmentTime = new Date(prediction.fulfillmentTime);
    const timeframeInHours = Number(prediction.timeframe);
    const symbolUpper = symbol.toUpperCase();

    // 1️⃣ Check if user already has an active prediction for this coin
    const hasActivePrediction = req.user.myPredictions.some(
      (p) => p.slug === slug && p.timeframe === prediction.timeframe
    );

    if (hasActivePrediction) {
      return res.status(400).json({
        msg: `⏳ You’ve already made a prediction for this coin in the selected timeframe (${
          (timeframeInHours === 24 && "24 Hours") ||
          (timeframeInHours === 7 && "7 Days") ||
          (timeframeInHours === 1 && "1 Month") ||
          `${timeframeInHours} Hours`
        }). Please wait for it to be fulfilled before submitting a new one.`,
      });
    }

    // 2️⃣ Check if text logically matches direction
    const isTextValid = await checkValidPrediction(prediction);

    if (isTextValid === false || isTextValid === "error") {
      return res.status(400).json({
        msg: "📝 Your explanation doesn't align with the chosen direction (Up or Down). Please adjust your reasoning.",
      });
    }

    if (isTextValid === "quota_exceeded") {
      return res.status(503).json({
        msg: "⚠️ Prediction validation temporarily unavailable due to API quota limits. Please try again later.",
      });
    }

    // 3️⃣ Direction correctness + threshold check
    const currentPrice = await getCurrentPrice(symbol);
    const targetPrice = parseFloat(prediction.targetPrice);

    const thresholdPercent =
      {
        BTC: 1.5,
        ETH: 1.5,
        DOGE: 2.5,
        SHIB: 3,
      }[symbolUpper] || 2;

    const priceDiffPercent =
      Math.abs((targetPrice - currentPrice) / currentPrice) * 100;

    const isDirectionCorrect =
      (prediction.direction === "positive" && targetPrice > currentPrice) ||
      (prediction.direction === "negative" && targetPrice < currentPrice);

    if (!isDirectionCorrect) {
      return res.status(400).json({
        msg: `📉 The target price must be ${
          prediction.direction === "positive" ? "higher" : "lower"
        } than the current market price ($${currentPrice}) to match the direction of your prediction.`,
      });
    }

    if (priceDiffPercent < thresholdPercent) {
      return res.status(400).json({
        msg: `⚠️ Your prediction must differ by at least ${thresholdPercent}% from the current market price ($${currentPrice}). Try setting a more ambitious target.`,
      });
    }

    // 4️⃣ Fulfillment must be in future
    if (fulfillmentTime <= now) {
      return res.status(400).json({
        msg: "⏰ The fulfillment time must be set in the future. Please select a valid time ahead of the current moment.",
      });
    }

    // ✅ All validations passed
    next();
  } catch (error) {
    console.error("❌ Validation middleware error:", error);
    return res.status(500).json({
      msg: "❌ Something went wrong during validation. Please try again.",
    });
  }
};

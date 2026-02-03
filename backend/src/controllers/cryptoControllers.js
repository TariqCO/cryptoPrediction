import { CryptoModel } from "../models/cryptoModel.js";
import { userModel } from "../models/userModel.js";
import { getSummaryGemini } from "../services/genAi.js";


export const addVote = async (req, res) => {
  const { slug, heading, symbol, prediction } = req.body;


  if (!slug || !heading || !symbol || !prediction) {
    return res.status(400).json({ msg: "All fields are required." });
  }

  if (!["positive", "negative"].includes(prediction.direction)) {
    return res
      .status(400)
      .json({ error: "Direction must be positive or negative." });
  }

  if (!req.user) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  try {
    const timeframe = prediction.timeframe || "24";

    let predictionDoc = await CryptoModel.findOne({ slug });

    const pushData = {
      "prediction.directions": {
        timeframe,
        value: prediction.direction,
        predictedBy: req.user._id,
      },
      "prediction.texts": {
        timeframe,
        content: prediction.text,
        predictedBy: req.user._id,
      },
      "prediction.confidence": {
        timeframe,
        value: prediction.confidence,
        predictedBy: req.user._id,
      },
      "prediction.targetPrices": {
        timeframe,
        value: prediction.targetPrice,
        predictedBy: req.user._id,
      },
      "prediction.fulfillmentTimes": {
        timeframe,
        date: prediction.fulfillmentTime,
        predictedBy: req.user._id,
      },
      "prediction.fulfilled": {
        timeframe,
        status: false,
      },
    };

    if (!predictionDoc) {
      predictionDoc = await CryptoModel.create({
        heading,
        slug,
        symbol,
        logo: logo || "", // or default
        prediction: {
          directions: [pushData["prediction.directions"]],
          texts: [pushData["prediction.texts"]],
          confidence: [pushData["prediction.confidence"]],
          targetPrices: [pushData["prediction.targetPrices"]],
          fulfillmentTimes: [pushData["prediction.fulfillmentTimes"]],
          fulfilled: [pushData["prediction.fulfilled"]],
        },

        fulfilled: [pushData["fulfilled"]],
      });
    } else {
      predictionDoc = await CryptoModel.findByIdAndUpdate(
        predictionDoc._id,
        { $push: pushData },
        { new: true }
      );
    }

    // 🔁 Add prediction to user's myPredictions
    await userModel.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        myPredictions: {
          predictionId: predictionDoc._id,
          slug,
          symbol,
          targetPrice: prediction.targetPrice,
          priceWhenVoting: prediction.currentPrice
            ? prediction.currentPrice.toFixed(2)
            : "0.00",
          direction: prediction.direction,
          logo: predictionDoc.logo,
          createdAt: new Date(),

          timeframe,
          confidence: prediction.confidence,
        },
      },
    });

    res.status(200).json(predictionDoc);
  } catch (err) {
    console.error("❌ Add Vote Error:", err);
    res.status(500).json({ error: "Server error while saving prediction." });
  }
};

/* ──────────────── 2. GET AVERAGE STATS & AI SUMMARY ───────────── */
export const getAverage = async (req, res) => {
  const { slug, timeframe } = req.params;
  const timeFrameWithOutAlphabet = timeframe.replace(/\D/g, "");


  const validTimeframes = ["24", "7", "1"];
  if (!validTimeframes.includes(timeFrameWithOutAlphabet)) {
    return res.status(400).json({ error: "Invalid timeframe" });
  }

  try {
    const doc = await CryptoModel.findOne({ slug });
    if (!doc) return res.json({ message: "No predictions yet" });

    // ⏳ Filter relevant timeframe entries
    const filterByTimeframe = (arr) =>
      arr.filter((entry) => entry.timeframe === timeFrameWithOutAlphabet);

    const directions = filterByTimeframe(doc.prediction.directions);
    const texts = filterByTimeframe(doc.prediction.texts);
    const targetPrices = filterByTimeframe(doc.prediction.targetPrices);
    const fulfillmentTimes = filterByTimeframe(doc.prediction.fulfillmentTimes);

    const total = directions.length;
    if (!total) {
      return res.json({
        message: `No prediction available for this timeframe (${timeFrameWithOutAlphabet})`,
      });
    }

if (!texts.length || !directions.length || !targetPrices.length || !fulfillmentTimes.length) {
  return res.status(400).json({ error: "Insufficient data for AI summary" });
}

    // 📊 Calculate direction statistics
    const positive = directions.filter((d) => d.value === "positive").length;
    const negative = directions.filter((d) => d.value === "negative").length;
    const upPercent = Math.round((positive / total) * 100);
    const downPercent = 100 - upPercent;

    // 🧠 AI Summary from Gemini
    const aiVerdict = await getSummaryGemini({
      heading: doc.heading,
      symbol: doc.symbol,
      texts: texts.map((t) => t.content),
      directions: directions.map((d) => d.value),
      fulfillments: fulfillmentTimes.map((f) => f.date),
      targetPrices: targetPrices.map((p) => p.value),
      timeframe: timeFrameWithOutAlphabet,
    });

    res.json({
      total,
      positive,
      negative,
      upPercent,
      downPercent,
      aiVerdict,
      timeFrameWithOutAlphabet,
    });
  } catch (error) {
    console.error("❌ Error in getAverage:", error.message);
    res.status(500).json({ error: "Failed to compute average." });
  }
};

/* ──────────────── 3. GET ALL PREDICTIONS ───────────────────────── */
export const allPredictions = async (req, res) => {
  try {
    const allCryptoCoins = await CryptoModel.find({});
    res.json(allCryptoCoins);
  } catch (error) {
    console.error("❌ Error fetching all predictions:", error);
    res.status(500).json({ error: "Failed to fetch predictions." });
  }
};

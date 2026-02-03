import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { formatPredictionSummaryPrompt } from "../functions/formatPredictions.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const FALLBACK_RESPONSE = {
  verdict: "Unable to determine",
  summary:
    "AI insights are temporarily unavailable. Please check back once more predictions are available.",
  mostCommonDirection: "unknown",
  notableReasons: [],
};

export const getSummaryGemini = async ({
  heading,
  symbol,
  texts = [],
  directions = [],
  fulfillments = [],
  targetPrices = [],
  timeframe,
}) => {
  try {
    if (!texts.length || !directions.length) {
      return {
        ...FALLBACK_RESPONSE,
        summary: "Not enough prediction data to generate AI insights.",
      };
    }

    const prompt = formatPredictionSummaryPrompt({
      heading,
      symbol,
      texts,
      directions,
      fulfillments,
      targetPrices,
      timeframe,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response?.text;
    if (!rawText || typeof rawText !== "string") {
      throw new Error("Empty or invalid AI response");
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in AI response");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      throw new Error("Invalid JSON format returned by AI");
    }

    return {
      verdict: parsed.verdict || FALLBACK_RESPONSE.verdict,
      summary: parsed.summary || FALLBACK_RESPONSE.summary,
      mostCommonDirection:
        parsed.mostCommonDirection || FALLBACK_RESPONSE.mostCommonDirection,
      notableReasons: Array.isArray(parsed.notableReasons)
        ? parsed.notableReasons
        : [],
    };
  } catch (error) {
    console.error("⚠️ Gemini Summary Error", {
      message: error.message,
      symbol,
      timeframe,
    });

    return FALLBACK_RESPONSE;
  }
};

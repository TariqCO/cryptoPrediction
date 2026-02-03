import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * ✅ Validates if a prediction text aligns with the given direction.
 * Returns:
 * - true  -> text clearly matches the direction
 * - false -> text does NOT match the direction
 * - 'quota_exceeded' -> API quota exceeded (429)
 * - 'error' -> other errors occurred
 */
export const checkValidPrediction = async ({ direction, text }) => {
  if (!direction || !text) {
    console.warn("⚠️ Missing direction or text for validation.");
    return "error";
  }

  const prompt = `
You are a strict AI prediction validator. Given a market direction and a prediction text, determine if the text *clearly and directly* supports the specified direction:

- If the direction is "positive", the text must indicate confidence in upward movement, growth, bullish momentum, or optimism.
- If the direction is "negative", the text must indicate expectation of decline, drop, bearish trend, or pessimism.
- Do NOT accept vague, neutral, or unrelated explanations.
- If the text does not clearly support the direction, or contradicts it in any way, return "false".

Respond with only one word: "true" or "false" (lowercase, no punctuation).

Direction: ${direction}
Text: ${text}
`;

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text?.toLowerCase().trim();

    if (rawText === "true") return true;
    if (rawText === "false") return false;

    // If response is unexpected
    console.warn("⚠️ Unexpected AI response for validation:", rawText);
    return "error";
  } catch (error) {
    if (error?.status === 429) {
      console.error("⚠️ Gemini API quota exceeded:", error.message);
      return "quota_exceeded";
    }

    console.error("❌ Error validating prediction with Gemini:", error?.message || error);
    return "error";
  }
};

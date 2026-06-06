import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// אתחול ה-AI עם המפתח מה-.env
const GEMINI_API_KEY = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateFinancialInsight = async (data) => {
  try {
    const model = GEMINI_API_KEY.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `אתה עוזר פיננסי חכם. נתח את הנתונים הבאים (נתונים אנונימיים): ${data}. 
    תן המלצה קצרה לחיסכון או תובנה מעניינת על דפוסי ההוצאה. ענה בעברית.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
 } catch (error) {
    console.error("Gemini API Detailed Error:", error.response ? error.response.data : error.message);
    throw new Error("Failed to generate insight");
}
};
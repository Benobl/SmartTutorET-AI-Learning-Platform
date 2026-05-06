import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        console.log("🔍 Fetching available models for your API key...");
        const result = await genAI.listModels();
        console.log("✅ Available Models:");
        result.models.forEach(m => {
            console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(", ")})`);
        });
    } catch (error) {
        console.error("❌ Failed to list models:", error.message);
    }
}

listModels();

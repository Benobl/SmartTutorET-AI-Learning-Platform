import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testSDK() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Using Key:", key.substring(0, 6) + "...");
    const genAI = new GoogleGenerativeAI(key);
    
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    
    for (const m of models) {
        try {
            console.log(`Testing model: ${m}`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hello");
            console.log(`Success with ${m}:`, result.response.text());
        } catch (e) {
            console.error(`Failed with ${m}:`, e.message);
        }
    }
}

testSDK();

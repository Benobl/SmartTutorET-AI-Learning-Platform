import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function listModels() {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    console.log("🔑 API Key Length:", apiKey.length);

    try {
        console.log(`\n🔍 Listing available models...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);
        
        if (response.data?.models) {
            console.log("✅ Models found:");
            response.data.models.forEach(m => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
            });
        } else {
            console.log("❓ No models returned in response data.");
        }
    } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.error?.message || error.message;
        console.error(`❌ FAILED to list models: ${status} - ${msg}`);
    }
}

listModels();

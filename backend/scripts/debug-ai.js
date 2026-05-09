import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function testGemini() {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    console.log("🔑 API Key Length:", apiKey.length);
    console.log("🔑 API Key Preview:", apiKey.substring(0, 5) + "...");

    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    const versions = ["v1beta", "v1"];

    for (const modelName of models) {
        for (const apiVersion of versions) {
            try {
                console.log(`\n🔍 Testing ${modelName} (${apiVersion})...`);
                const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;
                
                const response = await axios.post(url, {
                    contents: [{ parts: [{ text: "Hello, this is a connectivity test." }] }]
                }, { timeout: 10000 });

                if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    console.log(`✅ SUCCESS with ${modelName} (${apiVersion})`);
                    console.log("📄 Response:", response.data.candidates[0].content.parts[0].text);
                    return;
                }
            } catch (error) {
                const status = error.response?.status;
                const msg = error.response?.data?.error?.message || error.message;
                const details = JSON.stringify(error.response?.data?.error || {}, null, 2);
                console.error(`❌ FAILED ${modelName} (${apiVersion}): ${status} - ${msg}`);
                console.error(`📝 Details: ${details}`);
            }
        }
    }
}

testGemini();

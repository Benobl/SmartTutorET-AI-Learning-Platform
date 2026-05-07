import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No GEMINI_API_KEY found in .env");
        return;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: "Respond with only the word SUCCESS" }] }]
        });
        
        const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text === "SUCCESS") {
            console.log("✅ API KEY IS WORKING PERFECTLY!");
        } else {
            console.log("❓ API responded but not as expected:", text);
        }
    } catch (e) {
        console.error("❌ API KEY FAILED:", e.response?.data?.error?.message || e.message);
    }
}

test();

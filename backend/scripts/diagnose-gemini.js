import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function diagnose() {
    const key = process.env.GEMINI_API_KEY;
    const versions = ['v1beta', 'v1'];
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
    
    console.log("Using API Key starting with:", key.substring(0, 6));

    for (const v of versions) {
        for (const m of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${key}`;
                console.log(`Testing ${v} / ${m}...`);
                const res = await axios.post(url, {
                    contents: [{ parts: [{ text: "Hi" }] }]
                });
                console.log(`✅ SUCCESS: ${v}/${m} works!`);
                return; // Stop after first success
            } catch (e) {
                console.log(`❌ FAILED: ${v}/${m} - ${e.response?.status} ${e.response?.data?.error?.message || e.message}`);
            }
        }
    }
}

diagnose();

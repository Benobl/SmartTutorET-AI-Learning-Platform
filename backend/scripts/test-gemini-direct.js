import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testDirectAPI() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    
    const body = {
        contents: [{
            parts: [{ text: "Say hello" }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        console.log("Direct API Status:", response.status);
        console.log("Direct API Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Direct API Error:", error);
    }
}

testDirectAPI();

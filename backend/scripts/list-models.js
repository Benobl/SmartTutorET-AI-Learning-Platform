import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function list() {
    const key = process.env.GEMINI_API_KEY;
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const res = await axios.get(url);
        console.log("Available Models:", JSON.stringify(res.data.models.map(m => m.name), null, 2));
    } catch (e) {
        console.error("Failed to list models:", e.response?.data || e.message);
    }
}

list();

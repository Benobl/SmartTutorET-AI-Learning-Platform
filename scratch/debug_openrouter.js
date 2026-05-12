import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const testOpenRouter = async () => {
    const key = process.env.OPENROUTER_API_KEY;
    console.log("Using Key:", key.substring(0, 10) + "...");
    
    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "meta-llama/llama-3-70b-instruct",
            messages: [
                { role: "user", content: "Hello" }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            }
        });

        console.log("SUCCESS:", response.data.choices[0].message.content);
    } catch (err) {
        console.error("ERROR:", err.response?.data || err.message);
    }
};

testOpenRouter();

import axios from 'axios';

async function testPublicAI() {
    try {
        console.log("Testing Public AI Route...");
        const response = await axios.post('http://localhost:5001/api/ai/public-tutor-response', {
            studentQuery: "Explain photosynthesis in Amharic and English.",
            conversationHistory: []
        }, {
            headers: {
                "X-ST-CSRF": "XMLHttpRequest"
            }
        });
        console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

testPublicAI();

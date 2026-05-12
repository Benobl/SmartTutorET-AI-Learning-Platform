import axios from 'axios';

async function testRateLimit() {
    for (let i = 1; i <= 11; i++) {
        try {
            console.log(`Request ${i}...`);
            const response = await axios.post('http://localhost:5001/api/ai/public-tutor-response', {
                studentQuery: "Test query",
                conversationHistory: []
            }, {
                headers: {
                    "X-ST-CSRF": "XMLHttpRequest"
                }
            });
            console.log(`Request ${i} Success`);
        } catch (error) {
            console.log(`Request ${i} Failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
            break;
        }
    }
}

testRateLimit();

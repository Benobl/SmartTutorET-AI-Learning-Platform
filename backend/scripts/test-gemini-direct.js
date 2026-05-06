const API_KEY = "AIzaSyBIk8UkkBUzm9nKNDMv83HGmDF_G85xV3I";
const MODEL_NAME = "gemini-1.5-flash";

async function testFetch() {
    const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
    
    try {
        console.log(`📡 Testing direct fetch to: ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Say hello" }]
                }]
            })
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

testFetch();

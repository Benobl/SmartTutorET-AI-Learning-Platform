const API_KEY = "AIzaSyBIk8UkkBUzm9nKNDMv83HGmDF_G85xV3I";

async function listModelsFetch() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    
    try {
        console.log(`📡 Fetching models list from: ${url}`);
        const response = await fetch(url);
        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Models:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

listModelsFetch();

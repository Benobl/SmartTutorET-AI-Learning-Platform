import axios from "axios";
import "dotenv/config";

async function testCookies() {
    const API_URL = "http://localhost:5001/api";
    
    console.log("🧪 Testing Auth Cookies...");
    try {
        // 1. Attempt login
        console.log("📡 Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: "nebilbromance@gmail.com",
            password: "password123"
        });
        
        console.log("✅ Login Status:", loginRes.status);
        console.log("📥 Set-Cookie Headers:", loginRes.headers['set-cookie']);
        
        const cookies = loginRes.headers['set-cookie'];
        if (!cookies) {
            console.error("❌ No cookies returned from login!");
            return;
        }

        // 2. Extract refresh token cookie
        const refreshCookie = cookies.find(c => c.startsWith('refreshToken='));
        console.log("🍪 Refresh Cookie Found:", !!refreshCookie);

        // 3. Test refresh endpoint with the cookie
        console.log("\n📡 Testing Refresh...");
        const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: {
                Cookie: cookies.join('; ')
            }
        });
        
        console.log("✅ Refresh Status:", refreshRes.status);
        console.log("📥 Refresh Body:", refreshRes.data);
        
    } catch (error) {
        console.error("❌ Test Failed:", error.response?.data || error.message);
    }
}

testCookies();

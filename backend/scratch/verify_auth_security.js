import fetch from "node-fetch";

const testSecurity = async () => {
    const baseUrl = "http://localhost:5001/api/auth";
    const payloads = [
        { email: "😈@gmail.com", password: "123" },
        { email: "<script>alert(1)</script>@test.com", password: "123" },
        { email: "admin' OR 1=1--@test.com", password: "123" },
        { email: "valid@gmail.com", password: "wrong" }
    ];

    console.log("Starting Security Payload Tests...");

    for (const p of payloads) {
        try {
            const res = await fetch(`${baseUrl}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-ST-CSRF": "test" },
                body: JSON.stringify(p)
            });
            const data = await res.json();
            console.log(`Payload: ${p.email} | Status: ${res.status} | Message: ${data.message}`);
            
            if (data.message !== "Email or password is incorrect") {
                console.error("❌ FAILED: Message leaked details!");
            } else {
                console.log("✅ PASSED: Generic message returned.");
            }
        } catch (e) {
            console.error(`Error testing ${p.email}:`, e.message);
        }
    }
};

testSecurity();

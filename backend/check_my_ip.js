import http from "http";

const checkIP = () => {
    http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
        resp.on('data', function(ip) {
            console.log("\n==========================================");
            console.log("🔍 SmartTutorET Diagnostic Tool");
            console.log("==========================================");
            console.log("\nYour current Public IP address is: " + ip);
            console.log("\nCRITICAL ACTION REQUIRED:");
            console.log("1. Go to your MongoDB Atlas Dashboard.");
            console.log("2. Navigate to 'Network Access'.");
            console.log("3. Click 'Add IP Address'.");
            console.log("4. Add the IP address above: " + ip);
            console.log("5. Click 'Confirm' and wait 60 seconds.");
            console.log("\nOnce done, restart your backend server (npm run dev).");
            console.log("==========================================\n");
            process.exit(0);
        });
    });
};

checkIP();

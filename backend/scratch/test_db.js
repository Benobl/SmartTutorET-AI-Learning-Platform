import mongoose from 'mongoose';
import 'dotenv/config';

async function testConnection() {
  const mongoUri = "mongodb+srv://nebilbromance_db_user:a9icx9Qh1v00qran@cluster0.d38tvxt.mongodb.net/streamify_db?appName=Cluster0";
  console.log("Testing connection to:", mongoUri);
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connection Successful");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection Failed:", error.message);
    process.exit(1);
  }
}

testConnection();

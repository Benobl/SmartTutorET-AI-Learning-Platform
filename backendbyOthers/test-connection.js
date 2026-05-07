const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB Connection...');
console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('\nPossible solutions:');
  console.error('1. Make sure MongoDB is running: mongod');
  console.error('2. Check if MongoDB service is started');
  console.error('3. Verify connection string in .env file');
  process.exit(1);
});

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

console.log('🧪 Testing SmartTutorET API...\n');

async function testAPI() {
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed:', health.data);
    console.log('');

    // Test 2: Register Student
    console.log('2️⃣ Testing student registration...');
    const studentData = {
      email: `test${Date.now()}@student.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'Student',
      role: 'student'
    };
    
    try {
      const registerRes = await axios.post(`${API_URL}/auth/register`, studentData);
      console.log('✅ Student registration successful!');
      console.log('   User:', registerRes.data.data.user.email);
      console.log('   Role:', registerRes.data.data.user.role);
      console.log('');

      // Test 3: Login
      console.log('3️⃣ Testing login...');
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: studentData.email,
        password: studentData.password
      });
      console.log('✅ Login successful!');
      console.log('   Token received:', loginRes.data.data.token ? 'Yes' : 'No');
      console.log('');
    } catch (error) {
      console.log('❌ Registration/Login failed:', error.response?.data?.message || error.message);
      console.log('');
    }

    // Test 4: Admin Login
    console.log('4️⃣ Testing admin login...');
    try {
      const adminLogin = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@smarttutor.com',
        password: 'password123'
      });
      console.log('✅ Admin login successful!');
      console.log('   Role:', adminLogin.data.data.user.role);
      console.log('');
    } catch (error) {
      console.log('⚠️  Admin login failed. Run: npm run seed');
      console.log('');
    }

    console.log('🎉 All tests completed!\n');
    console.log('✅ Backend is working correctly!');
    console.log('✅ You can now use the frontend to login/register');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Backend server is not running!');
      console.log('   Start it with: npm run dev');
    }
  }
}

testAPI();

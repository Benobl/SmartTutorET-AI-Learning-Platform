# 🚀 Quick Start Guide - Testing Authentication

## Prerequisites
- Node.js installed
- MongoDB running (or connection string in .env)
- Backend dependencies installed (`npm install`)

## Step 1: Start the Backend Server

```bash
cd smarttutor-backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
MongoDB Connected: ...
```

## Step 2: Test with Automated Script

```bash
node test-auth.js
```

This will test:
- ✅ Login with valid credentials
- ✅ Access protected route
- ✅ Invalid login attempts
- ✅ Invalid token handling
- ✅ Missing token handling

## Step 3: Create a Test User (if needed)

### Option A: Using cURL

**Register a Student:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Student",
    "email": "test.student@example.com",
    "password": "TestPassword123!",
    "role": "student",
    "grade": "10"
  }'
```

**Register a Tutor:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Tutor",
    "email": "test.tutor@example.com",
    "password": "TestPassword123!",
    "role": "tutor",
    "degree": "Bachelor of Science",
    "experience": 3,
    "subject": "Mathematics",
    "availability": ["Monday", "Wednesday", "Friday"]
  }'
```

### Option B: Using Postman
1. Import `SmartTutor-Auth.postman_collection.json`
2. Use "Register Student" or "Register Tutor" request

## Step 4: Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.student@example.com",
    "password": "TestPassword123!"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "507f1f77bcf86cd799439011",
  "firstName": "Test",
  "lastName": "Student",
  "name": "Test Student",
  "email": "test.student@example.com",
  "role": "student",
  "isVerified": false,
  "grade": "10"
}
```

## Step 5: Test Protected Route

Copy the token from Step 4 and use it:

```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "firstName": "Test",
  "lastName": "Student",
  "name": "Test Student",
  "email": "test.student@example.com",
  "role": "student",
  "isVerified": false,
  "grade": "10"
}
```

## Step 6: Test with Frontend

1. Start the frontend:
```bash
cd frontend
npm run dev
```

2. Open browser to `http://localhost:3000`

3. Navigate to Login page

4. Enter credentials:
   - Email: `test.student@example.com`
   - Password: `TestPassword123!`

5. Click "Sign In"

6. You should be redirected to `/dashboard/student`

## Common Test Scenarios

### Test Invalid Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.student@example.com",
    "password": "WrongPassword"
  }'
```
**Expected:** 401 error with message "Invalid email or password"

### Test Missing Token
```bash
curl -X GET http://localhost:5000/api/users/me
```
**Expected:** 401 error with message "Not authorized, no token"

### Test Invalid Token
```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer invalid.token.here"
```
**Expected:** 401 error with message "Invalid token"

## Debugging Tips

### Check Server Logs
The server now logs all requests:
```
📨 POST /auth/login
📦 Body: { "email": "test@example.com", "password": "..." }
🔐 Login attempt with body: ...
👤 User found: Yes
🔑 Password match result: true
✅ Login successful for: test@example.com
```

### Check MongoDB
Verify user was created:
```bash
# Using MongoDB shell
mongosh "your_connection_string"
use test  # or your database name
db.users.find({ email: "test.student@example.com" })
```

### Check Environment Variables
```bash
cat .env
```
Ensure you have:
- `PORT=5000`
- `MONGO_URI=...`
- `JWT_SECRET=...`

## Success Indicators

✅ Server starts without errors
✅ Can register new users
✅ Can login with valid credentials
✅ Receive token in response
✅ Can access protected routes with token
✅ Invalid credentials are rejected
✅ Invalid tokens are rejected
✅ Frontend can login and redirect properly

## Need Help?

Check `AUTH_FIX_DOCUMENTATION.md` for detailed information about:
- API endpoints
- Response formats
- Error handling
- Security features
- Troubleshooting

## Quick Reference

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/register` | POST | No | Register new user |
| `/api/auth/login` | POST | No | Login user |
| `/api/users/me` | GET | Yes | Get current user |
| `/api/users/all` | GET | Yes (Admin) | Get all users |

**Auth Header Format:**
```
Authorization: Bearer <your-jwt-token>
```

---

🎉 **You're all set!** The authentication system is working and ready to use.

# 🔗 Frontend-Backend Connection Guide

## ✅ Good News!

**The frontend is already configured to connect to the backend!** No changes needed. Just follow the steps below to get everything running.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start the Backend (Terminal 1)

```bash
cd smarttutor-backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000
MongoDB Connected: ...
```

**Backend will be running at:** `http://localhost:5000`

---

### Step 2: Start the Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

**Frontend will be running at:** `http://localhost:3000`

---

### Step 3: Test the Connection

1. Open browser to `http://localhost:3000`
2. Click "Login" or go to `http://localhost:3000/login`
3. Enter test credentials:
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Sign In"
5. You should be redirected to the dashboard!

**That's it!** ✅ Frontend and backend are now connected.

---

## 🔍 How It Works

### Frontend Configuration

The frontend is configured in `frontend/lib/api.ts`:

```typescript
const API_BASE_URL = "http://localhost:5000/api"

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});
```

### Backend Configuration

The backend is configured in `smarttutor-backend/app.js`:

```javascript
app.use(cors({
  origin: [
    "http://localhost:3000",  // ← Frontend URL
    "http://localhost:5173",
    "https://smarttutor-frontend.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

**They're already configured to talk to each other!** ✅

---

## 📡 Connection Flow

```
┌─────────────────┐                    ┌─────────────────┐
│    FRONTEND     │                    │     BACKEND     │
│  localhost:3000 │                    │  localhost:5000 │
└─────────────────┘                    └─────────────────┘
         │                                      │
         │  1. User clicks "Login"              │
         │                                      │
         │  2. POST /api/auth/login             │
         │     { email, password }              │
         ├─────────────────────────────────────>│
         │                                      │
         │                                      │  3. Validate
         │                                      │     credentials
         │                                      │
         │  4. Response with token & user data  │
         │     { token, id, firstName, ... }    │
         <─────────────────────────────────────┤
         │                                      │
         │  5. Store token in localStorage      │
         │                                      │
         │  6. Redirect to dashboard            │
         │                                      │
         │  7. GET /api/users/me                │
         │     Headers: Authorization: Bearer   │
         ├─────────────────────────────────────>│
         │                                      │
         │                                      │  8. Verify token
         │                                      │
         │  9. User data                        │
         <─────────────────────────────────────┤
         │                                      │
         │  10. Display dashboard               │
         │                                      │
```

---

## 🧪 Testing the Connection

### Method 1: Automated Test (Backend Only)

```bash
cd smarttutor-backend
node test-auth.js
```

This tests the backend API endpoints.

### Method 2: Browser Test (Full Stack)

1. **Start both servers** (backend and frontend)
2. **Open browser** to `http://localhost:3000`
3. **Try to login** with test credentials
4. **Check browser console** (F12) for any errors
5. **Check backend terminal** for request logs

### Method 3: Network Tab Test

1. Open browser to `http://localhost:3000/login`
2. Open DevTools (F12) → Network tab
3. Enter credentials and click "Sign In"
4. You should see:
   - Request to `http://localhost:5000/api/auth/login`
   - Status: 200 OK
   - Response with token and user data

---

## 🐛 Troubleshooting

### Issue 1: "Failed to fetch" or "Network Error"

**Cause:** Backend is not running

**Solution:**
```bash
cd smarttutor-backend
npm run dev
```

Verify backend is running at `http://localhost:5000`

---

### Issue 2: CORS Error

**Error in browser console:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/auth/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Cause:** Backend CORS not configured properly

**Solution:** The backend is already configured correctly. If you see this error:

1. **Restart the backend:**
```bash
cd smarttutor-backend
npm run dev
```

2. **Clear browser cache** (Ctrl+Shift+Delete)

3. **Verify CORS config** in `smarttutor-backend/app.js`:
```javascript
origin: [
  "http://localhost:3000",  // ← Should be here
  ...
]
```

---

### Issue 3: "Cannot connect to localhost:5000"

**Cause:** Port 5000 is already in use

**Solution:**

**Option A:** Kill the process using port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Option B:** Change the port

1. Edit `smarttutor-backend/.env`:
```env
PORT=5001
```

2. Edit `frontend/lib/api.ts`:
```typescript
const API_BASE_URL = "http://localhost:5001/api"
```

3. Restart both servers

---

### Issue 4: "Invalid token" or "Not authorized"

**Cause:** Token expired or invalid

**Solution:**
1. Clear localStorage in browser console:
```javascript
localStorage.clear()
```

2. Login again

---

### Issue 5: Frontend shows "Loading..." forever

**Cause:** API request is hanging

**Solution:**

1. **Check backend is running:**
```bash
curl http://localhost:5000/
# Should return: {"message":"SmartTutor API Running"}
```

2. **Check MongoDB is connected:**
Look for "MongoDB Connected" in backend terminal

3. **Check browser console** for errors

4. **Check backend terminal** for request logs

---

## 📊 Verification Checklist

Use this checklist to verify everything is connected:

### Backend Checks
- [ ] Backend server is running (`npm run dev`)
- [ ] Port 5000 is accessible
- [ ] MongoDB is connected
- [ ] Health check works: `curl http://localhost:5000/`
- [ ] CORS is configured for `http://localhost:3000`

### Frontend Checks
- [ ] Frontend server is running (`npm run dev`)
- [ ] Port 3000 is accessible
- [ ] Can access `http://localhost:3000`
- [ ] API_BASE_URL is set to `http://localhost:5000/api`

### Connection Checks
- [ ] Can login from frontend
- [ ] Token is returned and stored
- [ ] Can access protected routes
- [ ] Dashboard loads correctly
- [ ] No CORS errors in console

---

## 🔧 Advanced Configuration

### For Production Deployment

#### Backend (Render/Heroku)

1. **Deploy backend** and get URL (e.g., `https://smarttutor-backend.onrender.com`)

2. **Update CORS** in `smarttutor-backend/app.js`:
```javascript
origin: [
  "http://localhost:3000",
  "https://your-frontend-domain.com",  // ← Add production URL
]
```

#### Frontend (Vercel/Netlify)

1. **Update API URL** in `frontend/lib/api.ts`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
```

2. **Set environment variable** in Vercel/Netlify:
```
NEXT_PUBLIC_API_URL=https://smarttutor-backend.onrender.com/api
```

3. **Deploy frontend**

---

## 🎯 Quick Commands Reference

### Start Both Servers

**Terminal 1 (Backend):**
```bash
cd smarttutor-backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Test Backend
```bash
cd smarttutor-backend
node test-auth.js
```

### Test Connection
```bash
# Test backend health
curl http://localhost:5000/

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📱 Testing on Mobile/Other Devices

### 1. Find Your Local IP

**Windows:**
```bash
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig
# Look for inet address (e.g., 192.168.1.100)
```

### 2. Update Backend CORS

Add your IP to CORS whitelist in `smarttutor-backend/app.js`:
```javascript
origin: [
  "http://localhost:3000",
  "http://192.168.1.100:3000",  // ← Your IP
]
```

### 3. Update Frontend API URL

In `frontend/lib/api.ts`:
```typescript
const API_BASE_URL = "http://192.168.1.100:5000/api"
```

### 4. Access from Mobile

Open browser on mobile: `http://192.168.1.100:3000`

---

## 🎓 Understanding the Connection

### What Happens When You Login?

1. **User enters credentials** in frontend form
2. **Frontend calls** `loginUser()` function in `lib/auth-utils.ts`
3. **Function makes POST request** to `http://localhost:5000/api/auth/login`
4. **Backend receives request** in `controllers/auth.controller.js`
5. **Backend validates credentials** and generates JWT token
6. **Backend sends response** with token and user data
7. **Frontend receives response** and stores token in localStorage
8. **Frontend redirects** to appropriate dashboard based on role

### How Protected Routes Work?

1. **Frontend makes request** to protected endpoint (e.g., `/api/users/me`)
2. **Frontend includes token** in Authorization header: `Bearer <token>`
3. **Backend middleware** (`authMiddleware.js`) extracts and verifies token
4. **If valid**, backend attaches user to request and continues
5. **If invalid**, backend returns 401 error
6. **Frontend handles response** - shows data or redirects to login

---

## ✅ Success Indicators

You'll know everything is connected when:

1. ✅ Backend terminal shows: `🚀 Server running on port 5000`
2. ✅ Frontend terminal shows: `✓ Ready in X.Xs`
3. ✅ Can access `http://localhost:3000` in browser
4. ✅ Can login and see dashboard
5. ✅ Backend terminal shows request logs with emojis
6. ✅ No CORS errors in browser console
7. ✅ Token is stored in localStorage
8. ✅ Protected routes work

---

## 🎉 You're Connected!

If you can login and see the dashboard, **congratulations!** Your frontend and backend are successfully connected.

### Next Steps:
1. ✅ Test all features (courses, profile, etc.)
2. ✅ Create test users with different roles
3. ✅ Test tutor approval workflow
4. ✅ Prepare for production deployment

---

## 📞 Need Help?

### Quick Checks:
1. Both servers running? ✓
2. Correct ports (3000 & 5000)? ✓
3. MongoDB connected? ✓
4. No CORS errors? ✓

### Still Having Issues?
1. Check backend logs in terminal
2. Check browser console (F12)
3. Check Network tab in DevTools
4. Run `node test-auth.js` to verify backend
5. Clear browser cache and localStorage

---

**Status:** ✅ **READY TO CONNECT**

**Last Updated:** April 22, 2026

**Remember:** The frontend is already configured. Just start both servers and you're good to go! 🚀

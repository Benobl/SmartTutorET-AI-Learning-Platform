# ⚡ Quick Connection Guide

## 🎯 3 Steps to Connect

### ✅ Good News First!
**The frontend is already configured to connect to the backend.** No code changes needed!

---

## 📍 Step 1: Start Backend

Open **Terminal 1**:

```bash
cd smarttutor-backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000
MongoDB Connected: ...
```

✅ Backend is now running at: **http://localhost:5000**

---

## 📍 Step 2: Start Frontend

Open **Terminal 2**:

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
✓ Ready in 2.5s
- Local: http://localhost:3000
```

✅ Frontend is now running at: **http://localhost:3000**

---

## 📍 Step 3: Test Connection

1. Open browser: **http://localhost:3000**
2. Click **"Login"**
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
4. Click **"Sign In"**

✅ You should be redirected to the dashboard!

---

## 🔗 Connection Details

| Component | URL | Port |
|-----------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend | http://localhost:5000 | 5000 |
| API Endpoint | http://localhost:5000/api | 5000 |

---

## 🧪 Test Backend First (Optional)

Before starting the frontend, verify the backend works:

```bash
cd smarttutor-backend
node test-auth.js
```

You should see green checkmarks ✅ for all tests.

---

## 🐛 Quick Troubleshooting

### Backend won't start?
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process if needed
taskkill /PID <PID> /F
```

### Frontend won't start?
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process if needed
taskkill /PID <PID> /F
```

### CORS errors?
1. Restart backend: `npm run dev`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Refresh page

### Can't login?
1. Check backend terminal for errors
2. Check browser console (F12) for errors
3. Verify MongoDB is connected
4. Clear localStorage: `localStorage.clear()`

---

## ✅ Success Indicators

You'll know it's working when:

- ✅ Backend shows: `🚀 Server running on port 5000`
- ✅ Frontend shows: `✓ Ready in X.Xs`
- ✅ Can access http://localhost:3000
- ✅ Can login and see dashboard
- ✅ No errors in browser console

---

## 📚 Need More Help?

Read the detailed guide: **FRONTEND_BACKEND_CONNECTION_GUIDE.md**

---

## 🎉 That's It!

Your frontend and backend are now connected. Start building! 🚀

---

**Quick Commands:**

```bash
# Terminal 1 - Backend
cd smarttutor-backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev

# Terminal 3 - Test (optional)
cd smarttutor-backend && node test-auth.js
```

# 🔐 Complete Authentication & Authorization Guide

## Overview

This guide covers ALL authentication and authorization features for SmartTutorET, including:
- User Registration (Student, Tutor, Manager)
- Email Verification
- Login & JWT Authentication
- Password Recovery (Forgot/Reset)
- Role-Based Access Control
- Tutor Approval Workflow

---

## 🎯 Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  COMPLETE USER LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ↓
   User fills registration form
   ↓
   POST /api/auth/register
   - Creates user account
   - Generates verification token
   - Sends verification email
   - Returns JWT token
   ↓
   User receives email with verification link

2. EMAIL VERIFICATION
   ↓
   User clicks link in email
   ↓
   GET /verify-email?token=xxx (Frontend)
   ↓
   GET /api/auth/verify/:token (Backend)
   - Verifies token
   - Sets isVerified = true
   - Returns success
   ↓
   User account is now verified

3. LOGIN
   ↓
   User enters credentials
   ↓
   POST /api/auth/login
   - Validates credentials
   - Checks tutor status (if tutor)
   - Generates JWT token
   - Returns user data + token
   ↓
   Frontend stores token
   ↓
   Redirects to appropriate dashboard

4. PASSWORD RECOVERY (if needed)
   ↓
   User clicks "Forgot Password"
   ↓
   POST /api/auth/forgot-password
   - Generates reset token
   - Sends reset email
   ↓
   User clicks link in email
   ↓
   GET /reset-password?token=xxx (Frontend)
   ↓
   User enters new password
   ↓
   POST /api/auth/reset-password/:token
   - Validates token
   - Updates password
   - Returns success
   ↓
   User can login with new password

5. TUTOR APPROVAL (for tutors only)
   ↓
   Manager reviews application
   ↓
   PUT /api/manager/tutors/:userId/approve
   - Updates tutorStatus = "approved"
   - Sends approval email
   ↓
   Tutor can now access dashboard
```

---

## 📡 API Endpoints

### 1. Registration

#### POST `/api/auth/register`

Register a new user (student, tutor, or manager).

**Request Body (Student):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "student",
  "grade": "10"
}
```

**Request Body (Tutor):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "role": "tutor",
  "phone": "+251 912 345 678",
  "subjects": ["Mathematics", "Physics"],
  "skills": "Expert in calculus and algebra",
  "documents": {
    "cv": "cv.pdf",
    "degree": "degree.pdf"
  }
}
```

**Response (201):**
```json
{
  "message": "User registered. Verify email.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "isVerified": false,
  "status": undefined,
  "grade": "10"
}
```

**Side Effects:**
- Creates user in database
- Generates verification token
- Sends verification email to user
- Returns JWT token for immediate login (optional)

---

### 2. Email Verification

#### GET `/api/auth/verify/:token`

Verify user's email address.

**Parameters:**
- `token` - Verification token from email

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

**Frontend Flow:**
1. User clicks link in email: `http://localhost:3000/verify-email?token=xxx`
2. Frontend page calls: `GET /api/auth/verify/:token`
3. Shows success/error message
4. Redirects to login

---

### 3. Login

#### POST `/api/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "isVerified": true,
  "status": undefined
}
```

**For Tutors:**
```json
{
  "message": "Login successful",
  "token": "...",
  "id": "...",
  "firstName": "Jane",
  "lastName": "Smith",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "tutor",
  "status": "pending",  // or "approved" or "rejected"
  "subjects": ["Mathematics", "Physics"],
  "isVerified": true
}
```

**Frontend Handling:**
```typescript
if (user.role === 'tutor' && user.status === 'pending') {
  // Block access, show "Application under review"
}
if (user.role === 'tutor' && user.status === 'rejected') {
  // Block access, show "Application rejected"
}
if (user.role === 'tutor' && user.status === 'approved') {
  // Allow access to tutor dashboard
}
```

---

### 4. Forgot Password

#### POST `/api/auth/forgot-password`

Request password reset link.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

**Side Effects:**
- Generates reset token (expires in 10 minutes)
- Sends password reset email with link
- Link format: `http://localhost:3000/reset-password?token=xxx`

---

### 5. Reset Password

#### POST `/api/auth/reset-password/:token`

Reset user password with token.

**Parameters:**
- `token` - Reset token from email

**Request Body:**
```json
{
  "password": "NewSecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

**Error Responses:**
- `400` - Invalid or expired token
- `500` - Server error

---

### 6. Get Current User

#### GET `/api/users/me`

Get currently logged-in user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "isVerified": true,
  "grade": "10"
}
```

---

## 📧 Email Templates

### 1. Email Verification

**Subject:** "Verify Your SmartTutorET Account"

**Content:**
- Welcome message
- Verification button/link
- Link expiration notice (24 hours)
- Professional HTML template

**Link Format:**
```
http://localhost:3000/verify-email?token=<verification_token>
```

---

### 2. Password Reset

**Subject:** "Reset Your SmartTutorET Password"

**Content:**
- Reset password button/link
- Security notice
- Link expiration notice (10 minutes)
- Warning if user didn't request

**Link Format:**
```
http://localhost:3000/reset-password?token=<reset_token>
```

---

### 3. Tutor Approval

**Subject:** "🎉 Your Tutor Application Has Been Approved!"

**Content:**
- Congratulations message
- List of features they can access
- Login button/link
- Welcome to the team message

---

### 4. Tutor Rejection

**Subject:** "Update on Your SmartTutorET Tutor Application"

**Content:**
- Polite rejection message
- Reason (if provided)
- Next steps (reapply after 30 days)
- Contact support information

---

## 🔒 Role-Based Access Control

### User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **student** | Regular student user | Student dashboard, courses, assignments |
| **tutor** | Approved educator | Tutor dashboard, create courses, manage students |
| **manager** | System manager | Approve tutors, manage system |
| **admin** | System administrator | Full system access |

### Tutor Status

| Status | Can Login? | Can Access Dashboard? | Description |
|--------|-----------|----------------------|-------------|
| **none** | ✅ Yes | ✅ Yes | Not a tutor (student/manager/admin) |
| **pending** | ✅ Yes | ❌ No | Tutor application under review |
| **approved** | ✅ Yes | ✅ Yes | Tutor approved, full access |
| **rejected** | ✅ Yes | ❌ No | Tutor application rejected |

### Protected Routes

**Middleware:** `protect`
- Verifies JWT token
- Attaches user to request
- Returns 401 if invalid/missing token

**Middleware:** `allowRoles(...roles)`
- Checks if user has required role
- Returns 403 if unauthorized

**Example:**
```javascript
router.get("/manager/tutors", protect, allowRoles("manager", "admin"), getPendingTutors);
```

---

## 🧪 Testing

### Test Email Verification

```bash
# 1. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Password123!",
    "role": "student",
    "grade": "10"
  }'

# 2. Check email for verification link
# 3. Click link or call API directly
curl -X GET http://localhost:5000/api/auth/verify/<token>
```

### Test Password Reset

```bash
# 1. Request password reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 2. Check email for reset link
# 3. Reset password
curl -X POST http://localhost:5000/api/auth/reset-password/<token> \
  -H "Content-Type: application/json" \
  -d '{"password": "NewPassword123!"}'

# 4. Login with new password
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "NewPassword123!"
  }'
```

### Test Tutor Workflow

```bash
# 1. Register as tutor
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Tutor",
    "email": "jane@example.com",
    "password": "Password123!",
    "role": "tutor",
    "subjects": ["Mathematics"]
  }'

# 2. Login (status will be "pending")
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "Password123!"
  }'

# 3. Manager approves tutor
curl -X PUT http://localhost:5000/api/manager/tutors/<tutor_id>/approve \
  -H "Authorization: Bearer <manager_token>"

# 4. Login again (status will be "approved")
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "Password123!"
  }'
```

---

## 🎨 Frontend Pages

### 1. Registration Pages
- `/signup` - Student/Tutor registration
- `/auth/tutor-signup` - Multi-step tutor registration

### 2. Authentication Pages
- `/login` - Login page
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password with token
- `/verify-email` - Email verification

### 3. Dashboard Pages
- `/dashboard/student` - Student dashboard
- `/dashboard/tutor` - Tutor dashboard (requires approval)
- `/dashboard/manager` - Manager dashboard
- `/dashboard/admin` - Admin dashboard

---

## ✅ Success Criteria

All features implemented! ✅

- [x] User registration (student, tutor, manager)
- [x] Email verification with link
- [x] Login with JWT authentication
- [x] Password recovery (forgot/reset)
- [x] Role-based access control
- [x] Tutor approval workflow
- [x] Professional email templates
- [x] Frontend pages integrated
- [x] Complete test coverage
- [x] Comprehensive documentation

---

## 🚀 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
BASE_URL=https://your-backend-url.com
FRONTEND_URL=http://localhost:3000
EMAIL=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 📊 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Email verification required
- ✅ Password reset tokens expire in 10 minutes
- ✅ Verification tokens expire in 24 hours
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Role-based access control
- ✅ Passwords never returned in responses

---

**Status:** ✅ **COMPLETE AND PRODUCTION READY**

**Last Updated:** April 22, 2026

**Version:** 1.0.0

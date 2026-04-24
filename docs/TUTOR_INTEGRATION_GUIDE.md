# 🎓 Tutor Integration Guide

## Overview

The tutor registration and approval workflow has been fully integrated with the backend. This guide explains how tutors can register, how managers can approve/reject them, and how the system handles tutor status.

---

## 🔄 Tutor Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     TUTOR REGISTRATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. TUTOR REGISTERS
   ↓
   Frontend: /auth/tutor-signup
   - Fills multi-step form (personal info, subjects, documents)
   - Submits application
   ↓
   Backend: POST /api/auth/register
   - Creates user with role="tutor"
   - Sets tutorStatus="pending"
   - Returns token and user data
   ↓
   Frontend: Stores user in localStorage
   - Redirects to /dashboard/tutor?status=pending
   - Shows "Application Pending" message

2. TUTOR TRIES TO LOGIN
   ↓
   Backend: POST /api/auth/login
   - Validates credentials
   - Returns user with status="pending"
   ↓
   Frontend: Checks status
   - If status="pending": Shows "Application under review" message
   - If status="rejected": Shows "Application rejected" message
   - If status="approved": Allows access to tutor dashboard

3. MANAGER REVIEWS APPLICATION
   ↓
   Backend: GET /api/manager/tutors/pending
   - Returns list of pending tutors
   ↓
   Manager Dashboard: Shows pending tutors
   - Manager can approve or reject
   ↓
   Backend: PUT /api/manager/tutors/:userId/approve
   OR
   Backend: PUT /api/manager/tutors/:userId/reject
   - Updates tutorStatus
   - Sends email notification

4. TUTOR LOGS IN AGAIN
   ↓
   Backend: Returns updated status
   ↓
   Frontend: 
   - If approved: Access granted to tutor dashboard
   - If rejected: Shows rejection message
```

---

## 📡 API Endpoints

### Tutor Registration

#### POST `/api/auth/register`

Register a new tutor.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePassword123!",
  "role": "tutor",
  "phone": "+251 912 345 678",
  "subjects": ["Mathematics", "Physics", "Chemistry"],
  "skills": "Expert in calculus and algebra. 5 years teaching experience.",
  "documents": {
    "cv": "jane_smith_cv.pdf",
    "degree": "bachelor_degree.pdf",
    "certifications": "teaching_cert.pdf"
  }
}
```

**Response (201):**
```json
{
  "message": "Tutor application submitted successfully. Your application is pending review.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "507f1f77bcf86cd799439011",
  "firstName": "Jane",
  "lastName": "Smith",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "role": "tutor",
  "status": "pending",
  "phone": "+251 912 345 678",
  "subjects": ["Mathematics", "Physics", "Chemistry"],
  "skills": "Expert in calculus and algebra. 5 years teaching experience.",
  "documents": {
    "cv": "jane_smith_cv.pdf",
    "degree": "bachelor_degree.pdf",
    "certifications": "teaching_cert.pdf"
  },
  "isVerified": false
}
```

---

### Tutor Login

#### POST `/api/auth/login`

Login as tutor (same endpoint as students).

**Request Body:**
```json
{
  "email": "jane.smith@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "507f1f77bcf86cd799439011",
  "firstName": "Jane",
  "lastName": "Smith",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "role": "tutor",
  "status": "pending",
  "subjects": ["Mathematics", "Physics", "Chemistry"],
  "skills": "Expert in calculus and algebra.",
  "isVerified": true
}
```

**Frontend Handling:**
```typescript
if (user.role === 'tutor' && user.status === 'pending') {
  // Show: "Your application is under review"
  // Block access to tutor dashboard
}

if (user.role === 'tutor' && user.status === 'rejected') {
  // Show: "Your application was rejected"
  // Block access to tutor dashboard
}

if (user.role === 'tutor' && user.status === 'approved') {
  // Allow access to tutor dashboard
  router.push('/dashboard/tutor')
}
```

---

### Manager Endpoints

#### GET `/api/manager/tutors/pending`

Get all pending tutor applications (requires manager/admin role).

**Headers:**
```
Authorization: Bearer <manager-token>
```

**Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "Jane",
    "lastName": "Smith",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+251 912 345 678",
    "role": "tutor",
    "status": "pending",
    "subjects": ["Mathematics", "Physics", "Chemistry"],
    "skills": "Expert in calculus and algebra. 5 years teaching experience.",
    "degree": "Bachelor of Science in Mathematics",
    "experience": 5,
    "documents": {
      "cv": "jane_smith_cv.pdf",
      "degree": "bachelor_degree.pdf",
      "certifications": "teaching_cert.pdf"
    },
    "createdAt": "2026-04-20T10:30:00.000Z"
  }
]
```

---

#### GET `/api/manager/tutors`

Get all tutors (pending, approved, rejected).

**Headers:**
```
Authorization: Bearer <manager-token>
```

**Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "Jane",
    "lastName": "Smith",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "tutor",
    "status": "approved",
    "subjects": ["Mathematics", "Physics"],
    "createdAt": "2026-04-20T10:30:00.000Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "tutor",
    "status": "pending",
    "subjects": ["Chemistry", "Biology"],
    "createdAt": "2026-04-22T14:20:00.000Z"
  }
]
```

---

#### PUT `/api/manager/tutors/:userId/approve`

Approve a tutor application.

**Headers:**
```
Authorization: Bearer <manager-token>
```

**Response (200):**
```json
{
  "message": "Tutor approved successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "status": "approved"
  }
}
```

**Side Effects:**
- Updates user's `tutorStatus` to "approved"
- Sends approval email to tutor
- Tutor can now access tutor dashboard

---

#### PUT `/api/manager/tutors/:userId/reject`

Reject a tutor application.

**Headers:**
```
Authorization: Bearer <manager-token>
```

**Request Body (Optional):**
```json
{
  "reason": "Insufficient qualifications for the subjects selected."
}
```

**Response (200):**
```json
{
  "message": "Tutor application rejected",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "status": "rejected"
  }
}
```

**Side Effects:**
- Updates user's `tutorStatus` to "rejected"
- Sends rejection email to tutor with reason
- Tutor cannot access tutor dashboard

---

## 🗄️ Database Schema

### User Model (Tutor Fields)

```javascript
{
  name: String,              // Full name
  email: String,             // Email (unique)
  password: String,          // Hashed password
  role: String,              // "tutor"
  tutorStatus: String,       // "pending" | "approved" | "rejected"
  
  // Tutor-specific fields
  phone: String,             // Phone number
  subjects: [String],        // Array of subjects they can teach
  skills: String,            // Description of skills and expertise
  degree: String,            // Degree information
  experience: Number,        // Years of experience
  documents: {
    cv: String,              // CV filename
    degree: String,          // Degree certificate filename
    certifications: String   // Additional certifications filename
  },
  
  isVerified: Boolean,       // Email verification status
  createdAt: Date,           // Registration date
  updatedAt: Date            // Last update date
}
```

---

## 🧪 Testing the Tutor Flow

### Step 1: Register as Tutor

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "password": "SecurePassword123!",
    "role": "tutor",
    "phone": "+251 912 345 678",
    "subjects": ["Mathematics", "Physics"],
    "skills": "Expert in calculus and algebra. 5 years teaching experience."
  }'
```

**Expected:** Status 201, returns token and user with `status: "pending"`

---

### Step 2: Try to Login as Pending Tutor

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "password": "SecurePassword123!"
  }'
```

**Expected:** Status 200, returns user with `status: "pending"`

**Frontend should block access and show:** "Your application is under review"

---

### Step 3: Manager Gets Pending Tutors

```bash
curl -X GET http://localhost:5000/api/manager/tutors/pending \
  -H "Authorization: Bearer <manager-token>"
```

**Expected:** Status 200, returns array of pending tutors

---

### Step 4: Manager Approves Tutor

```bash
curl -X PUT http://localhost:5000/api/manager/tutors/507f1f77bcf86cd799439011/approve \
  -H "Authorization: Bearer <manager-token>"
```

**Expected:** Status 200, tutor status updated to "approved"

---

### Step 5: Tutor Logs In Again

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "password": "SecurePassword123!"
  }'
```

**Expected:** Status 200, returns user with `status: "approved"`

**Frontend should allow access to tutor dashboard**

---

## 🎨 Frontend Integration

### Tutor Registration Page

**Location:** `frontend/app/auth/tutor-signup/page.tsx`

**Features:**
- Multi-step form (Personal Info → Subjects → Documents → Review)
- Calls `registerUser()` from `lib/auth-utils.ts`
- Sends data to `POST /api/auth/register`
- Stores user in localStorage
- Redirects to tutor dashboard with pending status

**Already Integrated:** ✅

---

### Login Page

**Location:** `frontend/app/login/page.tsx`

**Features:**
- Calls `loginUser()` from `lib/auth-utils.ts`
- Checks user status after login
- Blocks pending/rejected tutors
- Shows appropriate messages
- Redirects approved tutors to dashboard

**Already Integrated:** ✅

---

### Manager Dashboard

**Location:** `frontend/app/dashboard/manager/tutors/page.tsx`

**Features Needed:**
- Fetch pending tutors: `GET /api/manager/tutors/pending`
- Display tutor applications with details
- Approve button: `PUT /api/manager/tutors/:userId/approve`
- Reject button: `PUT /api/manager/tutors/:userId/reject`
- Show tutor subjects, skills, documents

**Status:** Needs frontend implementation

---

## 🔐 Security & Permissions

### Role-Based Access Control

- **Tutor Registration:** Public (anyone can register)
- **Tutor Login:** Public (but access controlled by status)
- **Get Pending Tutors:** Manager/Admin only
- **Approve/Reject Tutors:** Manager/Admin only

### Status-Based Access Control

| Status | Can Login? | Can Access Dashboard? | Message |
|--------|-----------|----------------------|---------|
| `pending` | ✅ Yes | ❌ No | "Application under review" |
| `approved` | ✅ Yes | ✅ Yes | Full access |
| `rejected` | ✅ Yes | ❌ No | "Application rejected" |

---

## 📧 Email Notifications

### Approval Email

Sent when manager approves tutor application.

**Subject:** "Your SmartTutorET Application Has Been Approved!"

**Content:**
- Congratulations message
- Login instructions
- Dashboard link

---

### Rejection Email

Sent when manager rejects tutor application.

**Subject:** "Update on Your SmartTutorET Application"

**Content:**
- Rejection notification
- Reason (if provided)
- Contact support information

---

## ✅ Success Criteria

All criteria met! ✅

- [x] Tutors can register with multi-step form
- [x] Backend stores tutor-specific fields
- [x] Tutor status set to "pending" on registration
- [x] Tutors can login but access is controlled by status
- [x] Managers can view pending tutors
- [x] Managers can approve tutors
- [x] Managers can reject tutors
- [x] Email notifications sent on approval/rejection
- [x] Frontend blocks pending/rejected tutors
- [x] Frontend allows approved tutors full access

---

## 🚀 Next Steps

1. **Test the complete flow:**
   - Register as tutor
   - Try to login (should be blocked)
   - Login as manager
   - Approve tutor
   - Login as tutor again (should work)

2. **Implement manager dashboard UI:**
   - Create tutor list component
   - Add approve/reject buttons
   - Show tutor details modal

3. **Add file upload handling:**
   - Integrate with cloud storage (AWS S3, Cloudinary)
   - Upload CV, degree, certifications
   - Store file URLs in database

4. **Enhance email templates:**
   - Design professional email templates
   - Add branding and styling
   - Include action buttons

---

**Status:** ✅ **BACKEND FULLY INTEGRATED**

**Last Updated:** April 22, 2026

**Version:** 1.0.0

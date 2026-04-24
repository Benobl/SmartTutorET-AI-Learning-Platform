# 🔐 Authentication Flow Diagram

## Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SMARTTUTOR AUTH FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐                                              ┌──────────────┐
│   FRONTEND   │                                              │   BACKEND    │
│ (Next.js)    │                                              │  (Express)   │
└──────────────┘                                              └──────────────┘
       │                                                              │
       │                                                              │
       │  1. User enters email & password                            │
       │     on /login page                                          │
       │                                                              │
       │  2. POST /api/auth/login                                    │
       │     { email, password }                                     │
       ├─────────────────────────────────────────────────────────────>
       │                                                              │
       │                                          3. Find user by email
       │                                             User.findOne({ email })
       │                                                              │
       │                                          4. Compare password
       │                                             bcrypt.compare()
       │                                                              │
       │                                          5. Generate JWT token
       │                                             jwt.sign({ id })
       │                                                              │
       │                                          6. Format response
       │                                             { token, id, firstName,
       │                                               lastName, email, role,
       │                                               isVerified, status }
       │                                                              │
       │  7. Response with token & user data                         │
       │     Status: 200                                             │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │  8. Store token in localStorage                             │
       │     localStorage.setItem('smarttutor_user', user)           │
       │                                                              │
       │  9. Redirect based on role:                                 │
       │     - admin    → /dashboard/admin                           │
       │     - tutor    → /dashboard/tutor                           │
       │     - manager  → /dashboard/manager                         │
       │     - student  → /dashboard/student                         │
       │                                                              │
       │                                                              │
       │  10. Access protected route                                 │
       │      GET /api/users/me                                      │
       │      Headers: { Authorization: "Bearer <token>" }           │
       ├─────────────────────────────────────────────────────────────>
       │                                                              │
       │                                          11. Extract token
       │                                              from Authorization header
       │                                                              │
       │                                          12. Verify token
       │                                              jwt.verify(token, secret)
       │                                                              │
       │                                          13. Find user by ID
       │                                              User.findById(decoded.id)
       │                                                              │
       │                                          14. Attach user to request
       │                                              req.user = user
       │                                                              │
       │                                          15. Format & return user
       │                                              { id, firstName, lastName,
       │                                                email, role, ... }
       │                                                              │
       │  16. User data returned                                     │
       │      Status: 200                                            │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │  17. Display user dashboard                                 │
       │                                                              │
       ▼                                                              ▼
```

---

## Registration Flow

```
┌──────────────┐                                              ┌──────────────┐
│   FRONTEND   │                                              │   BACKEND    │
└──────────────┘                                              └──────────────┘
       │                                                              │
       │  1. User fills registration form                            │
       │     - firstName, lastName, email, password                  │
       │     - role (student/tutor)                                  │
       │     - Additional fields based on role                       │
       │                                                              │
       │  2. POST /api/auth/register                                 │
       │     { firstName, lastName, email, password, role, ... }     │
       ├─────────────────────────────────────────────────────────────>
       │                                                              │
       │                                          3. Validate input
       │                                             Check required fields
       │                                                              │
       │                                          4. Check if email exists
       │                                             User.findOne({ email })
       │                                                              │
       │                                          5. Hash password
       │                                             bcrypt.hash(password, 10)
       │                                                              │
       │                                          6. Create user
       │                                             User.create({...})
       │                                             - tutorStatus: "pending" for tutors
       │                                             - tutorStatus: "none" for students
       │                                                              │
       │                                          7. Generate verification token
       │                                             crypto.randomBytes(32)
       │                                                              │
       │                                          8. Send verification email
       │                                             sendEmail(email, token)
       │                                                              │
       │                                          9. Generate JWT token
       │                                             jwt.sign({ id })
       │                                                              │
       │                                          10. Format response
       │                                              { token, id, firstName,
       │                                                lastName, email, role,
       │                                                isVerified, status }
       │                                                              │
       │  11. Response with token & user data                        │
       │      Status: 201                                            │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │  12. For students: Auto-login & redirect                    │
       │      For tutors: Show "pending approval" message            │
       │                                                              │
       ▼                                                              ▼
```

---

## Error Handling Flow

```
┌──────────────┐                                              ┌──────────────┐
│   FRONTEND   │                                              │   BACKEND    │
└──────────────┘                                              └──────────────┘
       │                                                              │
       │  POST /api/auth/login                                       │
       │  { email, password }                                        │
       ├─────────────────────────────────────────────────────────────>
       │                                                              │
       │                                          ┌─────────────────┐│
       │                                          │ Error Scenarios ││
       │                                          └─────────────────┘│
       │                                                              │
       │                                          ❌ Missing email/password
       │  Status: 400                                                │
       │  { message: "Email and password are required" }             │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │                                          ❌ User not found
       │  Status: 401                                                │
       │  { message: "Invalid email or password" }                   │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │                                          ❌ Wrong password
       │  Status: 401                                                │
       │  { message: "Invalid email or password" }                   │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │                                          ❌ Server error
       │  Status: 500                                                │
       │  { message: "Server error during login" }                   │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │  Display error message to user                              │
       │                                                              │
       ▼                                                              ▼

┌──────────────┐                                              ┌──────────────┐
│   FRONTEND   │                                              │   BACKEND    │
└──────────────┘                                              └──────────────┘
       │                                                              │
       │  GET /api/users/me                                          │
       │  Headers: { Authorization: "Bearer <token>" }               │
       ├─────────────────────────────────────────────────────────────>
       │                                                              │
       │                                          ┌─────────────────┐│
       │                                          │ Token Errors    ││
       │                                          └─────────────────┘│
       │                                                              │
       │                                          ❌ No token provided
       │  Status: 401                                                │
       │  { message: "Not authorized, no token" }                    │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │                                          ❌ Invalid token
       │  Status: 401                                                │
       │  { message: "Invalid token" }                               │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │                                          ❌ Expired token
       │  Status: 401                                                │
       │  { message: "Token expired" }                               │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │                                          ❌ User not found
       │  Status: 401                                                │
       │  { message: "User not found" }                              │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │  Redirect to login page                                     │
       │                                                              │
       ▼                                                              ▼
```

---

## Tutor Approval Workflow

```
┌──────────────┐                                              ┌──────────────┐
│   TUTOR      │                                              │   BACKEND    │
└──────────────┘                                              └──────────────┘
       │                                                              │
       │  1. Register as tutor                                       │
       │     POST /api/auth/register                                 │
       │     { role: "tutor", ... }                                  │
       ├─────────────────────────────────────────────────────────────>
       │                                                              │
       │                                          2. Create user with
       │                                             tutorStatus: "pending"
       │                                                              │
       │  3. Response: status = "pending"                            │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │  4. Frontend checks status                                  │
       │     if (status === "pending") {                             │
       │       show "Application under review" message               │
       │       block login                                           │
       │     }                                                        │
       │                                                              │
       │  5. Try to login                                            │
       │     POST /api/auth/login                                    │
       ├─────────────────────────────────────────────────────────────>
       │                                                              │
       │                                          6. Login succeeds
       │                                             (backend allows login)
       │                                                              │
       │  7. Response: status = "pending"                            │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │  8. Frontend blocks access                                  │
       │     Shows: "Your application is being reviewed..."          │
       │                                                              │
       │                                                              │
       │  ⏰ MANAGER APPROVES TUTOR                                  │
       │     (tutorStatus changed to "approved")                     │
       │                                                              │
       │                                                              │
       │  9. Try to login again                                      │
       │     POST /api/auth/login                                    │
       ├─────────────────────────────────────────────────────────────>
       │                                                              │
       │                                          10. Login succeeds
       │                                                              │
       │  11. Response: status = "approved"                          │
       <─────────────────────────────────────────────────────────────┤
       │                                                              │
       │  12. Frontend allows access                                 │
       │      Redirect to /dashboard/tutor                           │
       │                                                              │
       ▼                                                              ▼
```

---

## Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TOKEN LIFECYCLE                                │
└─────────────────────────────────────────────────────────────────────────┘

1. TOKEN GENERATION (Login/Register)
   ┌──────────────────────────────────────────────────────────┐
   │ jwt.sign(                                                 │
   │   { id: user._id },          // Payload                  │
   │   process.env.JWT_SECRET,    // Secret key               │
   │   { expiresIn: "7d" }        // Expiration               │
   │ )                                                         │
   └──────────────────────────────────────────────────────────┘
                            ↓
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxNjE2ODQzODIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c


2. TOKEN STORAGE (Frontend)
   ┌──────────────────────────────────────────────────────────┐
   │ localStorage.setItem('smarttutor_user', JSON.stringify({ │
   │   id: "...",                                              │
   │   firstName: "...",                                       │
   │   lastName: "...",                                        │
   │   email: "...",                                           │
   │   role: "...",                                            │
   │   token: "..."  // ← JWT token stored here               │
   │ }))                                                       │
   └──────────────────────────────────────────────────────────┘


3. TOKEN USAGE (Protected Routes)
   ┌──────────────────────────────────────────────────────────┐
   │ Request Headers:                                          │
   │ {                                                         │
   │   "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI..." │
   │   "Content-Type": "application/json"                      │
   │ }                                                         │
   └──────────────────────────────────────────────────────────┘


4. TOKEN VERIFICATION (Backend Middleware)
   ┌──────────────────────────────────────────────────────────┐
   │ 1. Extract token from Authorization header               │
   │    token = req.headers.authorization.split(" ")[1]       │
   │                                                           │
   │ 2. Verify token                                           │
   │    decoded = jwt.verify(token, process.env.JWT_SECRET)   │
   │                                                           │
   │ 3. Extract user ID from payload                           │
   │    userId = decoded.id                                    │
   │                                                           │
   │ 4. Find user in database                                  │
   │    user = await User.findById(userId)                    │
   │                                                           │
   │ 5. Attach user to request                                 │
   │    req.user = user                                        │
   │                                                           │
   │ 6. Continue to route handler                              │
   │    next()                                                 │
   └──────────────────────────────────────────────────────────┘


5. TOKEN EXPIRATION
   ┌──────────────────────────────────────────────────────────┐
   │ After 7 days:                                             │
   │                                                           │
   │ jwt.verify() throws TokenExpiredError                     │
   │                                                           │
   │ Backend returns:                                          │
   │ Status: 401                                               │
   │ { message: "Token expired" }                              │
   │                                                           │
   │ Frontend:                                                 │
   │ - Clears localStorage                                     │
   │ - Redirects to login page                                 │
   │ - User must login again                                   │
   └──────────────────────────────────────────────────────────┘
```

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA TRANSFORMATION                              │
└─────────────────────────────────────────────────────────────────────────┘

DATABASE (MongoDB)                    BACKEND (Express)
┌──────────────────┐                 ┌──────────────────┐
│ User Document    │                 │ Response Object  │
├──────────────────┤                 ├──────────────────┤
│ _id              │ ──────────────> │ id               │
│ name             │ ──────────────> │ firstName        │
│                  │                 │ lastName         │
│                  │                 │ name             │
│ email            │ ──────────────> │ email            │
│ password (hash)  │ ──────X────────>│ (not included)   │
│ role             │ ──────────────> │ role             │
│ tutorStatus      │ ──────────────> │ status           │
│ isVerified       │ ──────────────> │ isVerified       │
│ grade            │ ──────────────> │ grade            │
│ degree           │ ──────────────> │ degree           │
│ experience       │ ──────────────> │ experience       │
│ subject          │ ──────────────> │ subject          │
│ availability     │ ──────────────> │ availability     │
│ profileImage     │ ──────────────> │ profileImage     │
│ createdAt        │ ──────X────────>│ (not included)   │
│ updatedAt        │ ──────X────────>│ (not included)   │
└──────────────────┘                 └──────────────────┘
                                              │
                                              │
                                              ▼
                                     FRONTEND (Next.js)
                                     ┌──────────────────┐
                                     │ User Interface   │
                                     ├──────────────────┤
                                     │ id               │
                                     │ firstName        │
                                     │ lastName         │
                                     │ name             │
                                     │ email            │
                                     │ role             │
                                     │ status           │
                                     │ isVerified       │
                                     │ ...              │
                                     └──────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                  │
└─────────────────────────────────────────────────────────────────────────┘

Layer 1: CORS Protection
┌──────────────────────────────────────────────────────────────┐
│ ✓ Only allow requests from whitelisted origins               │
│ ✓ Credentials support enabled                                │
│ ✓ Specific methods allowed                                   │
│ ✓ Authorization header explicitly allowed                    │
└──────────────────────────────────────────────────────────────┘

Layer 2: Rate Limiting
┌──────────────────────────────────────────────────────────────┐
│ ✓ Max 100 requests per 15 minutes per IP                     │
│ ✓ Prevents brute force attacks                               │
└──────────────────────────────────────────────────────────────┘

Layer 3: Password Security
┌──────────────────────────────────────────────────────────────┐
│ ✓ Passwords hashed with bcrypt (10 salt rounds)              │
│ ✓ Passwords never returned in responses                      │
│ ✓ Password field excluded by default in queries              │
└──────────────────────────────────────────────────────────────┘

Layer 4: JWT Token Security
┌──────────────────────────────────────────────────────────────┐
│ ✓ Signed with secret key                                     │
│ ✓ 7-day expiration                                           │
│ ✓ Verified on every protected route                          │
│ ✓ Contains only user ID (no sensitive data)                  │
└──────────────────────────────────────────────────────────────┘

Layer 5: Input Validation
┌──────────────────────────────────────────────────────────────┐
│ ✓ Required fields checked                                    │
│ ✓ Email format validated                                     │
│ ✓ Duplicate email prevented                                  │
└──────────────────────────────────────────────────────────────┘

Layer 6: Role-Based Access Control
┌──────────────────────────────────────────────────────────────┐
│ ✓ Middleware checks user role                                │
│ ✓ Admin-only routes protected                                │
│ ✓ Tutor approval workflow enforced                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Status Codes
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (auth error)
- `403` - Forbidden (role restriction)
- `404` - Not Found
- `500` - Server Error

### Token Format
```
Authorization: Bearer <token>
```

### User Roles
- `student` - Regular student user
- `tutor` - Approved tutor
- `manager` - Manager with tutor approval rights
- `admin` - Full system access

### Tutor Status
- `none` - Not a tutor
- `pending` - Awaiting approval
- `approved` - Can access tutor dashboard
- `rejected` - Application denied

---

**Last Updated:** April 22, 2026

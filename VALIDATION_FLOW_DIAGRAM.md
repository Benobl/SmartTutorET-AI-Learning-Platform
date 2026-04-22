# Signup Validation Flow Diagram

## 📊 Complete Validation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER SUBMITS FORM                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND VALIDATION (Zod)                      │
│  • Required fields check                                         │
│  • Email format (regex)                                          │
│  • Password length (min 8)                                       │
│  • Name format (letters only)                                    │
│  • Role-specific fields                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌───────────┐     ┌──────────────┐
            │   VALID   │     │   INVALID    │
            └─────┬─────┘     └──────┬───────┘
                  │                  │
                  │                  ▼
                  │          ┌──────────────────┐
                  │          │ Show Client-Side │
                  │          │ Error Messages   │
                  │          └──────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SEND TO BACKEND API                           │
│  POST /api/auth/register                                         │
│  {                                                               │
│    firstName, lastName, email, password,                         │
│    role, grade/subjects/skills                                   │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND VALIDATION                             │
│                                                                  │
│  1. Required Fields Check                                        │
│     ├─ firstName, lastName, email, password                      │
│     └─ Return 400 with field-specific errors                     │
│                                                                  │
│  2. Name Format Validation                                       │
│     ├─ Regex: /^[A-Za-z]+$/                                      │
│     ├─ Min length: 2 characters                                  │
│     └─ Return 400 if invalid                                     │
│                                                                  │
│  3. Email Format Validation                                      │
│     ├─ Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/                       │
│     └─ Return 400 if invalid                                     │
│                                                                  │
│  4. Password Strength Validation                                 │
│     ├─ Min length: 8 characters                                  │
│     └─ Return 400 if too short                                   │
│                                                                  │
│  5. Role Validation                                              │
│     ├─ Valid roles: student, tutor, manager                      │
│     └─ Default to 'student' if invalid                           │
│                                                                  │
│  6. Student-Specific Validation                                  │
│     ├─ Grade required                                            │
│     ├─ Valid grades: 9, 10, 11, 12                               │
│     └─ Return 400 if missing/invalid                             │
│                                                                  │
│  7. Tutor-Specific Validation                                    │
│     ├─ Subjects array required (min 1)                           │
│     ├─ Skills required (min 20 chars)                            │
│     └─ Return 400 if missing                                     │
│                                                                  │
│  8. Duplicate Email Check                                        │
│     ├─ Query database for existing email                         │
│     └─ Return 400 if exists                                      │
│                                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌───────────┐     ┌──────────────┐
            │   VALID   │     │   INVALID    │
            └─────┬─────┘     └──────┬───────┘
                  │                  │
                  │                  ▼
                  │          ┌──────────────────────────┐
                  │          │ Return 400 Bad Request   │
                  │          │ {                        │
                  │          │   message: "...",        │
                  │          │   errors: {              │
                  │          │     field: "error msg"   │
                  │          │   }                      │
                  │          │ }                        │
                  │          └──────────┬───────────────┘
                  │                     │
                  │                     ▼
                  │          ┌──────────────────────────┐
                  │          │ FRONTEND CATCHES ERROR   │
                  │          │ • Extract errors object  │
                  │          │ • Set fieldErrors state  │
                  │          │ • Display below fields   │
                  │          │ • Add red borders        │
                  │          │ • Scroll to top          │
                  │          └──────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CREATE USER IN DATABASE                       │
│  • Hash password (bcrypt)                                        │
│  • Generate verification token                                   │
│  • Set tutor status (pending/approved)                           │
│  • Normalize data (trim, lowercase)                              │
│  • Save to MongoDB                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SEND VERIFICATION EMAIL                       │
│  • Generate verification link                                    │
│  • Send HTML email with link                                     │
│  • Don't fail if email fails                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GENERATE JWT TOKEN                            │
│  • Include user ID and role                                      │
│  • Set expiration (30 days)                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RETURN SUCCESS RESPONSE                       │
│  {                                                               │
│    message: "Registration successful!",                          │
│    token: "eyJhbGciOiJIUzI1NiIs...",                             │
│    id: "507f1f77bcf86cd799439011",                               │
│    firstName: "John",                                            │
│    lastName: "Doe",                                              │
│    email: "john@example.com",                                    │
│    role: "student",                                              │
│    isVerified: false,                                            │
│    status: "approved"                                            │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND SUCCESS HANDLING                     │
│  • Display success message                                       │
│  • Store token (optional)                                        │
│  • Redirect to login page                                        │
│  • Show "Check your email" message                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Error Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION ERROR OCCURS                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND FORMATS ERROR                         │
│  {                                                               │
│    message: "Validation failed",                                 │
│    errors: {                                                     │
│      email: "Please enter a valid email address",                │
│      password: "Password must be at least 8 characters",         │
│      firstName: "Only letters are allowed"                       │
│    }                                                             │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AXIOS CATCHES ERROR                           │
│  catch (err) {                                                   │
│    if (err.response?.data) {                                     │
│      const errorData = err.response.data                         │
│      if (errorData.errors) {                                     │
│        setFieldErrors(errorData.errors)                          │
│        setError(errorData.message)                               │
│      }                                                           │
│    }                                                             │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND DISPLAYS ERRORS                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │ ⚠️ Validation failed                               │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  Email Address                                                   │
│  ┌────────────────────────────────────────────────────┐         │
│  │ john@invalid                                       │ ❌      │
│  └────────────────────────────────────────────────────┘         │
│  ❌ Please enter a valid email address                          │
│                                                                  │
│  Password                                                        │
│  ┌────────────────────────────────────────────────────┐         │
│  │ ••••••                                             │ ❌      │
│  └────────────────────────────────────────────────────┘         │
│  ❌ Password must be at least 8 characters                      │
│                                                                  │
│  First Name                                                      │
│  ┌────────────────────────────────────────────────────┐         │
│  │ John123                                            │ ❌      │
│  └────────────────────────────────────────────────────┘         │
│  ❌ Only letters are allowed                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Field-Specific Validation Rules

```
┌─────────────────────────────────────────────────────────────────┐
│                         FIELD VALIDATION                         │
└─────────────────────────────────────────────────────────────────┘

firstName / lastName
├─ Required: ✓
├─ Min Length: 2
├─ Pattern: /^[A-Za-z]+$/
├─ Error: "Only letters allowed, min 2 characters"
└─ Example: "John" ✓ | "J" ✗ | "John123" ✗

email
├─ Required: ✓
├─ Pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
├─ Unique: ✓
├─ Normalized: toLowerCase()
├─ Error: "Valid email required, must be unique"
└─ Example: "john@example.com" ✓ | "invalid" ✗

password
├─ Required: ✓
├─ Min Length: 8
├─ Error: "Minimum 8 characters required"
└─ Example: "password123" ✓ | "short" ✗

role
├─ Required: ✓
├─ Enum: ["student", "tutor", "manager"]
├─ Default: "student"
└─ Example: "student" ✓ | "admin" ✗

grade (student only)
├─ Required: ✓ (if role = student)
├─ Enum: ["9", "10", "11", "12"]
├─ Error: "Grade must be 9, 10, 11, or 12"
└─ Example: "10" ✓ | "15" ✗

subjects (tutor only)
├─ Required: ✓ (if role = tutor)
├─ Type: Array
├─ Min Length: 1
├─ Error: "At least one subject required"
└─ Example: ["Math", "Physics"] ✓ | [] ✗

skills (tutor only)
├─ Required: ✓ (if role = tutor)
├─ Min Length: 20
├─ Error: "Skills description required (min 20 chars)"
└─ Example: "Expert in mathematics..." ✓ | "Good" ✗
```

---

## 🔐 Login Validation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER SUBMITS LOGIN                          │
│  { email: "john@example.com", password: "password123" }          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND VALIDATION                            │
│  • Email format check                                            │
│  • Password not empty                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND VALIDATION                             │
│  1. Check required fields                                        │
│  2. Validate email format                                        │
│  3. Find user in database                                        │
│  4. Compare password (bcrypt)                                    │
│  5. Check tutor status (if tutor)                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌───────────┐     ┌──────────────┐
            │   VALID   │     │   INVALID    │
            └─────┬─────┘     └──────┬───────┘
                  │                  │
                  │                  ▼
                  │          ┌──────────────────┐
                  │          │ Return 401       │
                  │          │ {                │
                  │          │   message: "...", │
                  │          │   errors: {      │
                  │          │     email/pwd    │
                  │          │   }              │
                  │          │ }                │
                  │          └──────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GENERATE JWT TOKEN                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RETURN SUCCESS                                │
│  {                                                               │
│    message: "Login successful",                                  │
│    token: "...",                                                 │
│    id, firstName, lastName, email, role, status                  │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REDIRECT TO DASHBOARD                         │
│  • Student → /dashboard/student                                  │
│  • Tutor → /dashboard/tutor                                      │
│  • Manager → /dashboard/manager                                  │
│  • Admin → /dashboard/admin                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Multi-Step Form Navigation

```
STUDENT SIGNUP (3 Steps)
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Step 1    │───▶│   Step 2    │───▶│   Step 3    │
│  Identity   │    │   Profile   │    │  Security   │
│             │    │             │    │             │
│ • firstName │    │ • grade     │    │ • password  │
│ • lastName  │    │             │    │             │
│ • email     │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │   SUBMIT    │
                                       └─────────────┘

TUTOR SIGNUP (4 Steps)
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Step 1    │───▶│   Step 2    │───▶│   Step 3    │───▶│   Step 4    │
│  Personal   │    │  Subjects   │    │  Documents  │    │   Review    │
│             │    │             │    │             │    │             │
│ • firstName │    │ • subjects  │    │ • cv        │    │ • confirm   │
│ • lastName  │    │ • skills    │    │ • degree    │    │   all data  │
│ • email     │    │             │    │ • certs     │    │             │
│ • phone     │    │             │    │             │    │             │
│ • password  │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                  │
                                                                  ▼
                                                           ┌─────────────┐
                                                           │   SUBMIT    │
                                                           └─────────────┘
```

---

## ✅ Validation Success Indicators

```
┌─────────────────────────────────────────────────────────────────┐
│                    VISUAL FEEDBACK SYSTEM                        │
└─────────────────────────────────────────────────────────────────┘

INVALID FIELD
┌────────────────────────────────────────────────────┐
│ john@invalid                                       │ ❌
└────────────────────────────────────────────────────┘
❌ Please enter a valid email address
└─ Red border, red error text

VALID FIELD
┌────────────────────────────────────────────────────┐
│ john@example.com                                   │ ✓
└────────────────────────────────────────────────────┘
└─ Normal border, no error

LOADING STATE
┌────────────────────────────────────────────────────┐
│                  ⏳ Creating Account...             │
└────────────────────────────────────────────────────┘
└─ Disabled button, spinner animation

SUCCESS STATE
┌────────────────────────────────────────────────────┐
│ ✅ Registration successful! Redirecting...         │
└────────────────────────────────────────────────────┘
└─ Green background, checkmark icon

ERROR STATE
┌────────────────────────────────────────────────────┐
│ ⚠️ Validation failed. Please fix the errors below. │
└────────────────────────────────────────────────────┘
└─ Red background, alert icon
```

---

This diagram provides a complete visual representation of the validation flow from user input to database storage, including all error handling paths and success scenarios.

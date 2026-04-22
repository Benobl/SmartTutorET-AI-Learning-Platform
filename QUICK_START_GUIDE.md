# Quick Start Guide - Signup Validation System

## 🚀 Getting Started

This guide will help you quickly test and verify the signup validation system.

---

## 📋 Prerequisites

- Node.js installed (v14 or higher)
- MongoDB running (local or cloud)
- Backend server running on `http://localhost:5000`
- Frontend server running on `http://localhost:3000`

---

## 🔧 Setup

### 1. Start Backend Server

```bash
cd smarttutor-backend
npm install
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB Connected: ...
```

### 2. Start Frontend Server

```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
Ready on http://localhost:3000
```

---

## 🧪 Testing Validation

### Option 1: Manual Testing (Browser)

#### Test Student Signup
1. Navigate to `http://localhost:3000/signup`
2. Select "I'm a Student"
3. Try these test cases:

**Test Case 1: Invalid Email**
- First Name: `John`
- Last Name: `Doe`
- Email: `invalid-email` ❌
- Expected: "Please enter a valid email address"

**Test Case 2: Short Password**
- First Name: `John`
- Last Name: `Doe`
- Email: `john@example.com`
- Password: `short` ❌
- Expected: "Password must be at least 8 characters"

**Test Case 3: Invalid Name**
- First Name: `John123` ❌
- Last Name: `Doe`
- Email: `john@example.com`
- Password: `password123`
- Expected: "Only letters are allowed"

**Test Case 4: Valid Registration**
- First Name: `John`
- Last Name: `Doe`
- Email: `john.doe@example.com`
- Password: `password123`
- Grade: `10`
- Expected: ✅ Success message, redirect to login

#### Test Tutor Signup
1. Navigate to `http://localhost:3000/auth/tutor-signup`
2. Try these test cases:

**Test Case 1: Missing Subjects**
- Fill personal info
- Skip subjects selection ❌
- Expected: "Please select at least one subject"

**Test Case 2: Short Skills Description**
- Fill personal info
- Select subjects
- Skills: `Good` ❌
- Expected: "Skills description should be at least 20 characters"

**Test Case 3: Valid Registration**
- First Name: `Jane`
- Last Name: `Smith`
- Email: `jane.smith@example.com`
- Phone: `+251912345678`
- Password: `password123`
- Subjects: `Mathematics`, `Physics`
- Skills: `Expert in mathematics and physics with 5 years of teaching experience`
- Upload documents
- Expected: ✅ Success message, redirect to login

### Option 2: Automated Testing (PowerShell)

```powershell
cd smarttutor-backend
powershell -ExecutionPolicy Bypass -File test-validation.ps1
```

Expected output:
```
========================================
TESTING SIGNUP VALIDATION
========================================

Test 1: Invalid email format
PASSED: Validation error caught

Test 2: Password too short
PASSED: Validation error caught

...

========================================
TESTS COMPLETED
========================================
```

### Option 3: Automated Testing (Node.js)

```bash
cd smarttutor-backend
node test-signup-validation.js
```

Expected output:
```
========================================
TESTING SIGNUP VALIDATION
========================================

Test: Missing required fields
✅ PASSED: Validation error caught

Test: Invalid email format
✅ PASSED: Validation error caught

...

========================================
TEST SUMMARY
========================================
Total tests: 12
Passed: 12
Failed: 0
========================================
```

---

## 🔍 Verification Checklist

### Backend Validation ✅
- [ ] Server starts without errors
- [ ] `/api/auth/register` endpoint responds
- [ ] Invalid email returns 400 error
- [ ] Short password returns 400 error
- [ ] Invalid name format returns 400 error
- [ ] Missing grade (student) returns 400 error
- [ ] Missing subjects (tutor) returns 400 error
- [ ] Duplicate email returns 400 error
- [ ] Valid registration returns 201 success
- [ ] Error response has `errors` object
- [ ] Success response has `token` and user data

### Frontend Error Handling ✅
- [ ] Frontend loads without errors
- [ ] Signup page displays correctly
- [ ] Form validation works (Zod)
- [ ] Server errors display below fields
- [ ] Invalid fields show red borders
- [ ] Error messages are clear and specific
- [ ] Success message displays on valid submission
- [ ] Redirect to login after success
- [ ] Multi-step form navigation works
- [ ] Error clears when user types

---

## 📊 Test Data

### Valid Student Data
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "student",
  "grade": "10"
}
```

### Valid Tutor Data
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "password": "password123",
  "role": "tutor",
  "phone": "+251912345678",
  "subjects": ["Mathematics", "Physics"],
  "skills": "Expert in mathematics and physics with 5 years of teaching experience"
}
```

### Invalid Test Cases
```json
// Invalid email
{
  "email": "invalid-email"
}

// Short password
{
  "password": "short"
}

// Invalid name
{
  "firstName": "John123"
}

// Missing grade (student)
{
  "role": "student"
  // grade missing
}

// Missing subjects (tutor)
{
  "role": "tutor"
  // subjects missing
}
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Server won't start
```
Error: Cannot find module 'express'
```
**Solution**:
```bash
cd smarttutor-backend
npm install
```

**Problem**: MongoDB connection error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**:
- Start MongoDB: `mongod` or check MongoDB Atlas connection
- Verify `.env` file has correct `MONGO_URI`

**Problem**: Email sending fails
```
Error: No recipients defined
```
**Solution**:
- This is expected if SMTP is not configured
- Registration will still succeed
- Check `.env` for email configuration

### Frontend Issues

**Problem**: Frontend won't start
```
Error: Cannot find module 'next'
```
**Solution**:
```bash
cd frontend
npm install
```

**Problem**: API connection error
```
Error: Network Error
```
**Solution**:
- Verify backend is running on `http://localhost:5000`
- Check `frontend/lib/api.ts` for correct API URL
- Check CORS configuration in backend

**Problem**: Errors not displaying
```
No error messages shown
```
**Solution**:
- Check browser console for errors
- Verify `fieldErrors` state is set
- Check error response format from backend

---

## 📝 Common Validation Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "First name is required" | Empty firstName field | Enter first name |
| "Only letters are allowed" | Name contains numbers/symbols | Use only letters |
| "First name must be at least 2 characters" | Name too short | Enter at least 2 characters |
| "Please enter a valid email address" | Invalid email format | Use format: name@domain.com |
| "Password must be at least 8 characters" | Password too short | Use at least 8 characters |
| "Grade is required for students" | Student without grade | Select grade 9-12 |
| "Please select at least one subject" | Tutor without subjects | Select at least 1 subject |
| "Skills description should be at least 20 characters" | Skills too short | Write detailed description |
| "This email is already registered" | Duplicate email | Use different email or login |

---

## 🎯 Expected Behavior

### Successful Student Registration
1. Fill all fields correctly
2. Click "Create Student Account"
3. See success message: "Registration successful! Please check your email to verify your account."
4. Redirect to login page after 2 seconds
5. Receive verification email (if SMTP configured)

### Successful Tutor Registration
1. Complete all 4 steps
2. Click "Submit Application"
3. See success message: "Application submitted! Please check your email to verify your account."
4. Redirect to login page after 3 seconds
5. Receive verification email
6. Status set to "pending" (awaiting manager approval)

### Failed Registration
1. Submit form with invalid data
2. See error message at top: "Validation failed"
3. See field-specific errors below each invalid field
4. Invalid fields have red borders
5. Stay on form (no redirect)
6. Fix errors and resubmit

---

## 🔐 Security Notes

### What's Protected
- ✅ SQL Injection (parameterized queries)
- ✅ XSS (input sanitization)
- ✅ Password strength (min 8 chars)
- ✅ Email validation (regex)
- ✅ Duplicate accounts (email uniqueness)
- ✅ Data integrity (type validation)

### What's NOT Protected (Yet)
- ⚠️ Rate limiting (can spam registrations)
- ⚠️ CAPTCHA (bots can register)
- ⚠️ Email verification required (can login without verifying)
- ⚠️ Password complexity (only length checked)

---

## 📚 Additional Resources

### Documentation
- [Complete Implementation Guide](./SIGNUP_VALIDATION_IMPLEMENTATION.md)
- [Task Summary](./TASK_5_COMPLETE_SUMMARY.md)
- [Validation Flow Diagram](./VALIDATION_FLOW_DIAGRAM.md)

### Code Files
- Backend: `smarttutor-backend/controllers/auth.controller.js`
- Frontend Signup: `frontend/app/signup/page.tsx`
- Frontend Tutor Signup: `frontend/app/auth/tutor-signup/page.tsx`
- Frontend Login: `frontend/app/login/page.tsx`

### Test Files
- Node.js Tests: `smarttutor-backend/test-signup-validation.js`
- PowerShell Tests: `smarttutor-backend/test-validation.ps1`

---

## ✅ Success Criteria

You'll know the system is working correctly when:

1. ✅ Backend server starts without errors
2. ✅ Frontend loads signup page correctly
3. ✅ Invalid data shows specific error messages
4. ✅ Valid data creates user successfully
5. ✅ Duplicate email is rejected
6. ✅ Student registration requires grade
7. ✅ Tutor registration requires subjects and skills
8. ✅ Success message displays and redirects
9. ✅ Verification email is sent (if SMTP configured)
10. ✅ All automated tests pass

---

## 🎉 Next Steps

Once validation is working:

1. **Test Email Verification**
   - Configure SMTP in `.env`
   - Register new user
   - Check email for verification link
   - Click link to verify account

2. **Test Login**
   - Navigate to `/login`
   - Enter registered credentials
   - Verify redirect to dashboard

3. **Test Tutor Approval**
   - Login as manager
   - Navigate to tutor management
   - Approve/reject pending tutors
   - Verify email notifications

4. **Test Password Reset**
   - Navigate to `/forgot-password`
   - Enter email
   - Check email for reset link
   - Reset password

---

## 💡 Tips

- Use unique emails for each test (add timestamp: `user${Date.now()}@example.com`)
- Check browser console for detailed error logs
- Check backend console for request/response logs
- Use browser DevTools Network tab to inspect API calls
- Clear localStorage if experiencing auth issues
- Use Postman/Insomnia for direct API testing

---

## 📞 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review the error messages in console
3. Verify all prerequisites are met
4. Check the implementation documentation
5. Review the code files mentioned above

---

**Last Updated**: April 22, 2026  
**Version**: 1.0.0  
**Status**: ✅ Ready for Testing

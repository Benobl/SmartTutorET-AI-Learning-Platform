const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finalsmartet', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB Connected Successfully\n');
  
  // Import models
  const User = require('./models/User');
  const Course = require('./models/Course');
  const TutorApplication = require('./models/TutorApplication');
  const Transaction = require('./models/Transaction');
  
  console.log('📊 DATABASE DATA CHECK\n');
  
  // 1. Check Users
  console.log('👥 USERS:');
  const users = await User.find({}, 'firstName lastName email role createdAt').sort({ createdAt: -1 }).limit(10);
  console.log(`Total users: ${users.length}`);
  users.forEach(user => {
    console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - ${user.createdAt.toLocaleDateString()}`);
  });
  
  // 2. Check Courses
  console.log('\n📚 COURSES:');
  const courses = await Course.find({}, 'title category price createdBy tutorVacancy.isOpen enrolledStudents').populate('createdBy', 'firstName lastName').limit(10);
  console.log(`Total courses: ${courses.length}`);
  courses.forEach(course => {
    console.log(`  - "${course.title}" (${course.category}) - $${course.price}`);
    console.log(`    Created by: ${course.createdBy?.firstName} ${course.createdBy?.lastName}`);
    console.log(`    Vacancy open: ${course.tutorVacancy?.isOpen ? '✅ Yes' : '❌ No'}`);
    console.log(`    Enrolled students: ${course.enrolledStudents?.length || 0}`);
  });
  
  // 3. Check Tutor Applications
  console.log('\n📝 TUTOR APPLICATIONS:');
  const applications = await TutorApplication.find({})
    .populate('tutor', 'firstName lastName email')
    .populate('course', 'title')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);
  
  console.log(`Total applications: ${applications.length}`);
  applications.forEach(app => {
    console.log(`  - ${app.tutor?.firstName} ${app.tutor?.lastName} applied to "${app.course?.title}"`);
    console.log(`    Status: ${app.status} - Applied: ${app.createdAt.toLocaleDateString()}`);
    if (app.reviewedBy) {
      console.log(`    Reviewed by: ${app.reviewedBy?.firstName} ${app.reviewedBy?.lastName}`);
    }
  });
  
  // 4. Check Transactions (Payments)
  console.log('\n💰 TRANSACTIONS (PAYMENTS):');
  const transactions = await Transaction.find({})
    .populate('user', 'firstName lastName email')
    .populate('course', 'title')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);
  
  console.log(`Total transactions: ${transactions.length}`);
  transactions.forEach(tx => {
    console.log(`  - ${tx.user?.firstName} ${tx.user?.lastName} paid $${tx.amount} for "${tx.course?.title}"`);
    console.log(`    Status: ${tx.status} - Method: ${tx.paymentMethod} - Date: ${tx.createdAt.toLocaleDateString()}`);
    if (tx.reviewedBy) {
      console.log(`    Reviewed by: ${tx.reviewedBy?.firstName} ${tx.reviewedBy?.lastName}`);
    }
  });
  
  // 5. Summary
  console.log('\n📈 SUMMARY:');
  console.log(`Total Users: ${await User.countDocuments()}`);
  console.log(`Total Courses: ${await Course.countDocuments()}`);
  console.log(`Total Tutor Applications: ${await TutorApplication.countDocuments()}`);
  console.log(`Total Transactions: ${await Transaction.countDocuments()}`);
  
  console.log('\n✅ Database check complete!');
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Simple User Schema (inline to avoid import issues)
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  role: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

const seedAdminUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Admin User
    const adminExists = await User.findOne({ email: 'admin@smarttutor.com' });
    if (!adminExists) {
      await User.create({
        email: 'admin@smarttutor.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Admin user created');
      console.log('   Email: admin@smarttutor.com');
      console.log('   Password: password123\n');
    } else {
      console.log('ℹ️  Admin user already exists\n');
    }

    // Create Manager User
    const managerExists = await User.findOne({ email: 'manager@smarttutor.com' });
    if (!managerExists) {
      await User.create({
        email: 'manager@smarttutor.com',
        password: hashedPassword,
        firstName: 'Manager',
        lastName: 'User',
        role: 'manager',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Manager user created');
      console.log('   Email: manager@smarttutor.com');
      console.log('   Password: password123\n');
    } else {
      console.log('ℹ️  Manager user already exists\n');
    }

    console.log('✅ Seeding completed successfully!');
    console.log('\nYou can now login with:');
    console.log('- Admin: admin@smarttutor.com / password123');
    console.log('- Manager: manager@smarttutor.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedAdminUsers();

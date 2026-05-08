import mongoose from "mongoose";
import bcrypt from "bcryptjs";
export const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/smarttutor";
        const con = await mongoose.connect(mongoUri);
        console.log(`✅ MongoDB Connected: ${con.connection.host}`);

        // --- Auto-Seed Admin ---
        const User = (await import("../modules/users/user.model.js")).default;
        const adminEmail = "admin@smarttutor.com";
        const adminExists = await User.findOne({ email: adminEmail });
        
        const hashedPassword = bcrypt.hashSync("adminpassword", 10);
        console.log(`[DB-SEED] Generated Hash for "adminpassword": ${hashedPassword}`);

        if (!adminExists) {
            console.log("🚀 Seeding initial admin account...");
            await User.create({
                name: "System Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                isApproved: true,
                isVerified: true
            });
            console.log("✅ Admin account created: admin@smarttutor.com / adminpassword");
        } else {
            // Force reset for stabilization
            adminExists.password = hashedPassword;
            await adminExists.save();
            console.log("ℹ️ Admin account password reset to default (pre-hashed).");
        }

        // --- Mock Students Seeding ---
        const studentCount = await User.countDocuments({ role: "student" });
        if (studentCount === 0) {
            console.log("🎓 Seeding mock students...");
            const studentPass = bcrypt.hashSync("studentpassword", 10);
            await User.insertMany([
                {
                    name: "Abel Tesfaye",
                    email: "abel@student.com",
                    password: studentPass,
                    role: "student",
                    isVerified: true,
                    grade: "12",
                    stream: "Natural Science"
                },
                {
                    name: "Sara Solomon",
                    email: "sara@student.com",
                    password: studentPass,
                    role: "student",
                    isVerified: true,
                    grade: "11",
                    stream: "Social Science"
                },
                {
                    name: "Kebede Molla",
                    email: "kebede@student.com",
                    password: studentPass,
                    role: "student",
                    isVerified: false,
                    grade: "10",
                    stream: "Common"
                },
                {
                    name: "Marta Haile",
                    email: "marta@student.com",
                    password: studentPass,
                    role: "student",
                    isVerified: true,
                    grade: "12",
                    stream: "Natural Science"
                }
            ]);
            console.log("✅ Mock students seeded successfully.");
        }

        // --- Mock Tutors Seeding ---
        const tutorCount = await User.countDocuments({ role: "tutor" });
        if (tutorCount === 0) {
            console.log("👨‍🏫 Seeding mock tutors...");
            const tutorPass = bcrypt.hashSync("tutorpassword", 10);
            await User.insertMany([
                {
                    name: "Abrham Belay",
                    email: "abrham@tutor.com",
                    password: tutorPass,
                    role: "tutor",
                    isApproved: false,
                    isVerified: true,
                    tutorStatus: "pending",
                    subjectSpecialty: "Advanced Mathematics"
                },
                {
                    name: "Tigist G/Medhin",
                    email: "tigist@tutor.com",
                    password: tutorPass,
                    role: "tutor",
                    isApproved: false,
                    isVerified: true,
                    tutorStatus: "pending",
                    subjectSpecialty: "Physics"
                }
            ]);
            console.log("✅ Mock tutors seeded.");
        }


        // --- Mock Subjects Seeding ---
        const Subject = (await import("../modules/courses/subject.model.js")).default;
        const subjectCount = await Subject.countDocuments();
        if (subjectCount === 0) {
            console.log("📚 Seeding mock curriculum...");
            const firstTutor = await User.findOne({ role: "tutor" });
            await Subject.create([
                {
                    title: "Quantum Physics Introduction",
                    category: "Science",
                    price: 49.99,
                    status: "pending",
                    tutor: firstTutor ? firstTutor._id : null,
                    description: "A deep dive into the quantum world."
                },
                {
                    title: "Advanced Calculus II",
                    category: "Mathematics",
                    price: 39.99,
                    status: "pending",
                    tutor: firstTutor ? firstTutor._id : null,
                    description: "Mastering complex integration techniques."
                }
            ]);
            console.log("✅ Mock subjects seeded.");
        }

        // --- Mock Payments Seeding ---
        const Payment = (await import("../modules/payments/payment.model.js")).default;
        const paymentCount = await Payment.countDocuments();
        if (paymentCount === 0) {
            console.log("💰 Seeding mock revenue...");
            const firstStudent = await User.findOne({ role: "student" });
            const firstSubject = await Subject.findOne();
            await Payment.create([
                {
                    amount: 49.99,
                    status: "completed",
                    student: firstStudent ? firstStudent._id : null,
                    subject: firstSubject ? firstSubject._id : null,
                    paymentMethod: "telebirr",
                    transactionId: "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase()
                },
                {
                    amount: 39.99,
                    status: "completed",
                    student: firstStudent ? firstStudent._id : null,
                    subject: firstSubject ? firstSubject._id : null,
                    paymentMethod: "chapa",
                    transactionId: "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase()
                }
            ]);
            console.log("✅ Mock payments seeded.");
        }

        // --- Mock Settings Seeding ---
        const Settings = (await import("../modules/admin/settings.model.js")).default;
        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            console.log("⚙️ Seeding initial settings...");
            await Settings.create({
                platformName: "SmartTutor-ET",
                supportEmail: "admin@smarttutor.edu",
                twoFactorEnabled: false
            });
            console.log("✅ System settings initialized.");
        }

    } catch (error) {
        console.log("❌ Error in connecting to MongoDB:", error.message);
        console.error(error);
    }
};

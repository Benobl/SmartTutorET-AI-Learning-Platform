import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/users/user.model.js';
import Assignment from './src/modules/assessments/assignment.model.js';
import AssignmentSubmission from './src/modules/assessments/assignmentSubmission.model.js';
import Subject from './src/modules/courses/subject.model.js';
import Enrollment from './src/modules/learning/enrollment.model.js';

dotenv.config();

async function fixData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const nebilEmail = 'nebilbromance@gmail.com';
        const student = await User.findOne({ email: nebilEmail });
        if (!student) {
            console.log('Student not found:', nebilEmail);
            return;
        }
        console.log('Found Student:', student._id, student.name);

        // 1. Fix Student Grade
        if (student.grade === undefined || student.grade === null) {
            student.grade = 9; // Assuming grade 9 based on the Biology subject
            await student.save();
            console.log('Updated student grade to 9');
        }

        // 2. Find the orphaned submission and reassign to Nebil
        // Orphaned student ID found earlier: 69eccf3a03330ed963a4fee5
        const orphanedId = '69eccf3a03330ed963a4fee5';
        const submissions = await AssignmentSubmission.find({ student: orphanedId });
        console.log(`Found ${submissions.length} submissions for orphaned ID ${orphanedId}`);

        for (const sub of submissions) {
            sub.student = student._id;
            await sub.save();
            console.log(`Reassigned submission ${sub._id} to Nebil`);
        }

        // 3. Enroll Nebil in the Biology subject (69fba4c430063fe0f33fa7ce)
        const biologyId = '69fba4c430063fe0f33fa7ce';
        const biology = await Subject.findById(biologyId);
        if (biology) {
            if (!biology.students.includes(student._id)) {
                biology.students.push(student._id);
                // Also remove the orphaned ID if it's there
                biology.students = biology.students.filter(id => id.toString() !== orphanedId);
                await biology.save();
                console.log('Enrolled Nebil in Biology and removed orphaned reference');
            }
        }

        // 4. Ensure EnrollmentV2 entry exists
        const existingEnrollment = await Enrollment.findOne({ studentId: student._id, courseId: biologyId });
        if (!existingEnrollment) {
            await Enrollment.create({ studentId: student._id, courseId: biologyId });
            console.log('Created EnrollmentV2 for Nebil in Biology');
        }

        console.log('Data fix complete');

    } catch (error) {
        console.error('Error during data fix:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixData();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/users/user.model.js';
import Assignment from './src/modules/assessments/assignment.model.js';
import AssignmentSubmission from './src/modules/assessments/assignmentSubmission.model.js';
import Subject from './src/modules/courses/subject.model.js';

dotenv.config();

async function checkNebil() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const student = await User.findOne({ email: 'nebilbromance@gmail.com' });
        if (!student) {
            console.log('Student not found');
            return;
        }
        console.log('Student:', { id: student._id, name: student.name, grade: student.grade });

        const submissions = await AssignmentSubmission.find({ student: student._id })
            .populate('assignment');
        
        console.log('Submissions:', submissions.map(s => ({
            id: s._id,
            assignment: s.assignment ? s.assignment.title : 'Deleted Assignment',
            status: s.status,
            marks: s.marksObtained,
            subject: s.assignment ? s.assignment.subject : 'N/A'
        })));

        if (submissions.length > 0 && submissions[0].assignment) {
            const subject = await Subject.findById(submissions[0].assignment.subject);
            console.log('Subject for first submission:', subject ? { id: subject._id, title: subject.title, grade: subject.grade } : 'Subject not found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkNebil();

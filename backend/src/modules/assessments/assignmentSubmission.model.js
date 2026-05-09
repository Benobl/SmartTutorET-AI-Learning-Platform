import mongoose from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String, // Text submission from student
        },
        attachments: [{
            type: String, // URLs to uploaded submission files
        }],
        status: {
            type: String,
            enum: ["submitted", "evaluated"],
            default: "submitted",
        },
        marksObtained: {
            type: Number,
            default: null,
        },
        feedback: {
            type: String, // Feedback from the tutor
            default: "",
        }
    },
    { timestamps: true }
);

assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const AssignmentSubmission = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
export default AssignmentSubmission;

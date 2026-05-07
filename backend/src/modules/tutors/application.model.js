import mongoose from "mongoose";

const tutorApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TutorJob",
        required: true
    },
    coverLetter: {
        type: String,
    },
    qualifications: [{
        degree: String,
        institution: String,
        year: Number,
    }],
    degreeAttachments: [{
        fileName: String,
        fileUrl: String,
    }],
    teachingPhilosophy: {
        type: String
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    rejectionReason: {
        type: String
    }
}, { timestamps: true });

const TutorApplication = mongoose.model("TutorApplication", tutorApplicationSchema);
export default TutorApplication;

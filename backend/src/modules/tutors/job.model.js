import mongoose from "mongoose";

const tutorJobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const TutorJob = mongoose.model("TutorJob", tutorJobSchema);
export default TutorJob;

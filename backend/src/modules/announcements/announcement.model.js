import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        body: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["academic", "administrative", "urgent", "general"],
            default: "general",
        },
        targetGrade: {
            type: String, // "9", "10", "11", "12"
            default: null,
        },
        targetTutor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // If from a tutor for their classes
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String, // "admin", "manager", "tutor"
            required: true,
        }
    },
    { timestamps: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;

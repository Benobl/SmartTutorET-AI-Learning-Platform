import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },
        session: {
            type: String, // sessionId or date
            required: true,
        },
        status: {
            type: String,
            enum: ["present", "absent", "late"],
            default: "present",
        }
    },
    { timestamps: true }
);

// Prevent duplicate attendance for same student in same session
attendanceSchema.index({ student: 1, session: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;

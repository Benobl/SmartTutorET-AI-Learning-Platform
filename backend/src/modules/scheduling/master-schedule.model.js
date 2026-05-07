import mongoose from "mongoose";

const masterScheduleSchema = new mongoose.Schema({
    grade: { 
        type: String, 
        enum: ["9", "10", "11", "12"], 
        required: true 
    },
    stream: { 
        type: String, 
        enum: ["Natural Science", "Social Science", "Common"], 
        default: "Common" 
    },
    semester: {
        type: String,
        default: "Semester 1"
    },
    section: {
        type: String,
        default: "Section A"
    },
    subject: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Subject", 
        required: true 
    },
    tutor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: false 
    },
    dayOfWeek: { 
        type: String, 
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] 
    },
    date: { 
        type: Date 
    }, // Specific date for exams or one-to-one
    startTime: { 
        type: String, 
        required: true 
    },
    endTime: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ["regular", "midterm", "final", "one-to-one"], 
        default: "regular" 
    },
    room: { 
        type: String, 
        default: "Virtual Classroom" 
    },
    isOnline: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

const MasterSchedule = mongoose.model("MasterSchedule", masterScheduleSchema);
export default MasterSchedule;

import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["personal", "academic"],
      default: "academic",
    },
    tasks: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;

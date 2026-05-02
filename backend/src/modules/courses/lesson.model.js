import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
    },
    duration: {
      type: Number, // in minutes
    },
    order: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Lesson = mongoose.model("Lesson", lessonSchema);
export default Lesson;

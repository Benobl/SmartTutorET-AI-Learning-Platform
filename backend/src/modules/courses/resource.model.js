import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["pdf", "doc", "link"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Resource = mongoose.model("Resource", resourceSchema);
export default Resource;

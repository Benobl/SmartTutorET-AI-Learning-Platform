import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
        },
        duration: {
            type: String, // e.g., "15:30"
        },
        thumbnail: {
            type: String,
        },
        size: {
            type: Number, // in bytes
        },
        format: {
            type: String, // e.g., "mp4"
        },
        source: {
            type: String,
            enum: ["uploaded", "recording"],
            default: "uploaded",
        }
    },
    {
        timestamps: true,
    }
);

const Video = mongoose.model("Video", videoSchema);
export default Video;

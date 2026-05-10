import mongoose from "mongoose";

const youtubeLinkSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
        },
        videoId: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
        },
        duration: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const YouTubeLink = mongoose.model("YouTubeLink", youtubeLinkSchema);
export default YouTubeLink;

import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
    {
        instruction: {
            type: String,
            required: true,
        },
        content: {
            type: String, // Could be markdown or HTML
        },
        externalUrl: {
            type: String,
        },
        attachments: [String],
        points: {
            type: Number,
            default: 10,
        }
    },
    {
        timestamps: true,
    }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);
export default Exercise;

import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
        },
        size: {
            type: Number, // in bytes
        },
        pageCount: {
            type: Number,
        },
        filename: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const PDF = mongoose.model("PDF", pdfSchema);
export default PDF;

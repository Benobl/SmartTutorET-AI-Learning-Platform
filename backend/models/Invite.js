import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
    {
        inviter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        invitee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        targetType: {
            type: String,
            enum: ["StudyGroup", "LiveSession"],
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "targetType",
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

const Invite = mongoose.model("Invite", inviteSchema);
export default Invite;

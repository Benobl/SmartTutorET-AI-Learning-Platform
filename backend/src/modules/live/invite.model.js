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
        session: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LiveSession",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "pending",
        },
    },
    {
        timestamps: true,
        collection: "invites",
    }
);

const Invite = mongoose.model("Invite", inviteSchema);
export default Invite;

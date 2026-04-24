import Invite from "../models/Invite.js";
import StudyGroup from "../models/StudyGroup.js";
import LiveSession from "../models/LiveSession.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const sendInvite = async (req, res) => {
    try {
        const { inviteeId, targetType, targetId } = req.body;
        const inviterId = req.user._id;

        if (inviterId.toString() === inviteeId) {
            return res.status(400).json({ message: "You cannot invite yourself" });
        }

        const newInvite = new Invite({
            inviter: inviterId,
            invitee: inviteeId,
            targetType,
            targetId,
        });

        await newInvite.save();

        // Notify invitee via socket
        const receiverSocketId = getReceiverSocketId(inviteeId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newInvite", newInvite);
        }

        res.status(201).json(newInvite);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const respondToInvite = async (req, res) => {
    try {
        const { inviteId, status } = req.body; // status: 'accepted' or 'declined'
        const invite = await Invite.findById(inviteId);

        if (!invite) return res.status(404).json({ message: "Invite not found" });
        if (invite.invitee.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        invite.status = status;
        await invite.save();

        if (status === "accepted") {
            if (invite.targetType === "StudyGroup") {
                await StudyGroup.findByIdAndUpdate(invite.targetId, {
                    $addToSet: { members: req.user._id },
                });
            } else if (invite.targetType === "LiveSession") {
                await LiveSession.findByIdAndUpdate(invite.targetId, {
                    $addToSet: { participants: req.user._id },
                });
            }
        }

        res.status(200).json({ message: `Invite ${status}`, invite });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyInvites = async (req, res) => {
    try {
        const invites = await Invite.find({ invitee: req.user._id, status: "pending" })
            .populate("inviter", "fullName profilePic")
            .populate("targetId");
        res.status(200).json(invites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

import { InviteService } from "./invite.service.js";
import { getReceiverSocketId, io } from "../../lib/socket.js";

export class InviteController {
    static async send(req, res, next) {
        try {
            const { alreadyPending, invite } = await InviteService.sendInvite(req.user._id, req.body);

            if (alreadyPending) {
                return res.status(200).json({ success: true, message: "Invite already pending", alreadyPending: true, data: invite });
            }

            // Notify recipient in real-time (populate fields for the socket payload)
            const populatedInvite = await invite.populate([
                { path: "inviter", select: "fullName profilePic" },
                { path: "invitee", select: "fullName profilePic" },
                { path: "targetId", select: "name topic" },
            ]);
            const receiverSocketId = getReceiverSocketId(req.body.inviteeId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("new-invite", populatedInvite.toObject());
            }

            res.status(201).json({ success: true, data: populatedInvite });
        } catch (error) {
            next(error);
        }
    }

    static async getMine(req, res, next) {
        try {
            const invites = await InviteService.getMyInvites(req.user._id);
            res.json({ success: true, data: invites });
        } catch (error) {
            next(error);
        }
    }

    static async respond(req, res, next) {
        try {
            const invite = await InviteService.respondToInvite(req.user._id, req.body.inviteId, req.body.status);
            res.json(invite);
        } catch (error) {
            next(error);
        }
    }
}

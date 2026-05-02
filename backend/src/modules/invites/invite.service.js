import Invite from "../live/invite.model.js";
import Group from "../social/group.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class InviteService {
    static async sendInvite(senderId, inviteData) {
        const { inviteeId, sessionId } = inviteData;

        if (senderId.toString() === inviteeId?.toString()) {
            throw new ApiError(400, "You cannot invite yourself");
        }

        const existing = await Invite.findOne({
            inviter: senderId,
            invitee: inviteeId,
            session: sessionId,
            status: "pending"
        });

        if (existing) return { alreadyPending: true, invite: existing };

        const invite = await Invite.create({
            session: sessionId,
            inviter: senderId,
            invitee: inviteeId
        });
        return { alreadyPending: false, invite };
    }

    static async getMyInvites(userId) {
        return await Invite.find({
            $or: [{ invitee: userId }, { inviter: userId }]
        })
            .populate("inviter", "name profile.avatar")
            .populate("invitee", "name profile.avatar")
            .populate("session")
            .lean();
    }

    static async respondToInvite(userId, inviteId, status) {
        const invite = await Invite.findById(inviteId);
        if (!invite) throw new ApiError(404, "Invite not found");
        if (invite.invitee.toString() !== userId.toString()) throw new ApiError(403, "Not authorized to respond to this invite");

        invite.status = status;
        await invite.save();

        return invite;
    }
}

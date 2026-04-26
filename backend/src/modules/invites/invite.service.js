import Invite from "../groups/invite.model.js";
import StudyGroup from "../groups/group.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class InviteService {
    static async sendInvite(senderId, inviteData) {
        const { inviteeId, targetId, targetType } = inviteData;

        if (senderId.toString() === inviteeId?.toString()) {
            throw new ApiError(400, "You cannot invite yourself");
        }

        // Check if already a member if target is StudyGroup
        if (targetType === "StudyGroup") {
            const group = await StudyGroup.findById(targetId);
            if (group && group.members.includes(inviteeId)) {
                throw new ApiError(400, "User is already a member of this squad");
            }
        }

        const existing = await Invite.findOne({
            inviter: senderId,
            invitee: inviteeId,
            targetId,
            status: "pending"
        });

        if (existing) return { alreadyPending: true, invite: existing };

        const invite = await Invite.create({
            targetId,
            targetType,
            inviter: senderId,
            invitee: inviteeId
        });
        return { alreadyPending: false, invite };
    }

    static async getMyInvites(userId) {
        return await Invite.find({
            $or: [{ invitee: userId }, { inviter: userId }]
        })
            .populate("inviter", "fullName profilePic")
            .populate("invitee", "fullName profilePic")
            .populate("targetId");
    }

    static async respondToInvite(userId, inviteId, status) {
        const invite = await Invite.findById(inviteId);
        if (!invite) throw new ApiError(404, "Invite not found");
        if (invite.invitee.toString() !== userId.toString()) throw new ApiError(403, "Not authorized to respond to this invite");

        invite.status = status;
        await invite.save();

        if (status === "accepted" && invite.targetType === "StudyGroup") {
            const group = await StudyGroup.findById(invite.targetId);
            if (group && !group.members.includes(userId)) {
                group.members.push(userId);
                await group.save();
            }
        }

        return invite;
    }
}

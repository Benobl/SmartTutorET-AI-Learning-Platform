import Invite from "../groups/invite.model.js";
import StudyGroup from "../groups/group.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class InviteService {
    static async sendInvite(senderId, inviteData) {
        return await Invite.create({
            ...inviteData,
            sender: senderId
        });
    }

    static async getMyInvites(userId) {
        return await Invite.find({ invitee: userId })
            .populate("sender", "fullName")
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

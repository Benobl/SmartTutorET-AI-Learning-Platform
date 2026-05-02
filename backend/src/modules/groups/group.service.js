import Group from "../social/group.model.js";
import Forum from "../social/forum.model.js";
import Thread from "../social/thread.model.js";
import LiveSession from "../live/live.model.js";
import Invite from "../live/invite.model.js";
import { ApiError } from "../../middleware/error.middleware.js";
import { addStreamChannelMember } from "../../lib/stream.js";
import { io } from "../../lib/socket.js";

export class GroupService {
    static async createGroup(createdBy, groupData) {
        const group = await Group.create({
            ...groupData,
            createdBy,
            members: [createdBy]
        });

        // Automatically create a default forum for the group
        await Forum.create({
            group: group._id,
            createdBy,
            title: "General Discussion",
            description: `Welcome to the ${group.name} general forum.`
        });

        // Integrate with Stream
        await addStreamChannelMember(`squad-${group._id}`, createdBy);

        return group;
    }

    static async addMember(groupId, userId) {
        const group = await Group.findById(groupId);
        if (!group) throw new ApiError(404, "Group not found");

        if (group.members.some(m => m.toString() === userId.toString())) {
            throw new ApiError(400, "User already a member of this group");
        }

        group.members.push(userId);
        await group.save();

        // Integrate with Stream
        await addStreamChannelMember(`squad-${group._id}`, userId);

        return group;
    }

    static async createThread(forumId, authorId, threadData) {
        return await Thread.create({
            ...threadData,
            forum: forumId,
            author: authorId
        });
    }

    static async getGroupForums(groupId) {
        let forums = await Forum.find({ group: groupId });
        if (forums.length === 0) {
            const group = await Group.findById(groupId);
            if (group) {
                const defaultForum = await Forum.create({
                    group: group._id,
                    createdBy: group.createdBy,
                    title: "General Discussion",
                    description: `Welcome to the ${group.name} general forum.`
                });
                forums = [defaultForum];
            }
        }
        return forums;
    }

    static async getForumThreads(forumId) {
        return await Thread.find({ forum: forumId }).populate("author", "name profile.avatar");
    }

    static async getUserGroups(userId) {
        const groups = await Group.find({ members: userId }).populate("members", "name profile.avatar role");

        // Ensure user is added to Stream channels for all their squads
        // This helps resolve permission issues if they were missed during initial join
        for (const group of groups) {
            try {
                await addStreamChannelMember(`squad-${group._id}`, userId);
            } catch (e) {
                console.error(`[Stream] Failed to sync member ${userId} to squad ${group._id}:`, e);
            }
        }

        return groups;
    }

    static async getAllGroups() {
        return await Group.find({});
    }

    static async toggleLive(groupId, userId, isLive, sessionData = null) {
        try {
            console.log(`[GroupService] Toggling live for ${groupId}, user: ${userId}, isLive: ${isLive}`);
            const group = await Group.findById(groupId);
            if (!group) throw new ApiError(404, "Group not found");

            // Verify membership
            const isMember = group.members.some(m => m.toString() === userId.toString());
            if (!isMember) {
                throw new ApiError(403, "You must be a member of this squad to manage live sessions");
            }

            let session;
            if (isLive) {
                session = await LiveSession.create({
                    title: sessionData?.title || `${group.name} Live Session`,
                    subject: group.subject,
                    host: userId,
                    startTime: new Date(),
                    isActive: true,
                    roomType: "group_call",
                    participants: [userId]
                });
            } else {
                session = await LiveSession.findOneAndUpdate(
                    { host: userId, isActive: true },
                    { isActive: false, endTime: new Date() },
                    { new: true }
                );
            }

            // Defensive Broadcast to squad room
            if (typeof io !== 'undefined' && io) {
                try {
                    io.to(`squad_${groupId.toString()}`).emit("squad-live-started", {
                        squadId: groupId.toString(),
                        callId: sessionData?.callId || sessionData?.id,
                        hostId: userId.toString(),
                        isLive: !!isLive,
                        sessionId: session?._id
                    });
                } catch (socketErr) {
                    console.error(`[GroupService] Socket broadcast failed:`, socketErr);
                }
            }

            console.log(`[GroupService] Successfully toggled live for ${groupId}`);
            return session;
        } catch (error) {
            console.error(`[GroupService] Error toggling live for ${groupId}:`, error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, `Failed to toggle session: ${error.message}`);
        }
    }
}

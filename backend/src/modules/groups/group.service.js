import StudyGroup from "./group.model.js";
import Forum from "./forum.model.js";
import Thread from "./thread.model.js";
import Post from "./post.model.js";
import Invite from "./invite.model.js";
import { ApiError } from "../../middleware/error.middleware.js";
import { addStreamChannelMember } from "../../lib/stream.js";
import { io } from "../../lib/socket.js";

export class GroupService {
    static async createGroup(creatorId, groupData) {
        const group = await StudyGroup.create({
            ...groupData,
            creator: creatorId,
            members: [creatorId]
        });

        // Automatically create a default forum for the group
        await Forum.create({
            relatedId: group._id,
            typeModel: "StudyGroup",
            type: "group",
            title: "General Discussion",
            description: `Welcome to the ${group.name} general forum.`
        });

        // Integrate with Stream
        await addStreamChannelMember(`squad-${group._id}`, creatorId);

        return group;
    }

    static async addMember(groupId, userId) {
        const group = await StudyGroup.findById(groupId);
        if (!group) throw new ApiError(404, "Group not found");

        if (group.members.includes(userId)) {
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
            forumId,
            author: authorId
        });
    }

    static async createPost(threadId, authorId, content) {
        return await Post.create({
            threadId,
            author: authorId,
            content
        });
    }

    static async getGroupForums(groupId) {
        let forums = await Forum.find({ relatedId: groupId, typeModel: "StudyGroup" });
        if (forums.length === 0) {
            const group = await StudyGroup.findById(groupId);
            if (group) {
                const defaultForum = await Forum.create({
                    relatedId: group._id,
                    typeModel: "StudyGroup",
                    type: "group",
                    title: "General Discussion",
                    description: `Welcome to the ${group.name} general forum.`
                });
                forums = [defaultForum];
            }
        }
        return forums;
    }

    static async getForumThreads(forumId) {
        return await Thread.find({ forumId }).populate("author", "fullName profilePic");
    }

    static async getThreadPosts(threadId) {
        return await Post.find({ threadId }).populate("author", "fullName profilePic");
    }

    static async getUserGroups(userId) {
        const groups = await StudyGroup.find({ members: userId }).populate("members", "fullName profilePic role");

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
        return await StudyGroup.find({});
    }

    static async toggleLive(groupId, userId, isLive, sessionData = null) {
        try {
            console.log(`[GroupService] Toggling live for ${groupId}, user: ${userId}, isLive: ${isLive}`);
            const group = await StudyGroup.findById(groupId);
            if (!group) throw new ApiError(404, "Group not found");

            // Verify membership
            const isMember = group.members.some(m => m.toString() === userId.toString());
            if (!isMember) {
                throw new ApiError(403, "You must be a member of this squad to manage live sessions");
            }

            group.isLive = !!isLive;
            group.sessionData = isLive ? sessionData : null;
            await group.save();

            // Defensive Broadcast to squad room
            if (typeof io !== 'undefined' && io) {
                try {
                    io.to(`squad_${groupId.toString()}`).emit("squad-live-started", {
                        squadId: groupId.toString(),
                        callId: sessionData?.callId || sessionData?.id,
                        hostId: userId.toString(),
                        isLive: !!isLive
                    });
                } catch (socketErr) {
                    console.error(`[GroupService] Socket broadcast failed:`, socketErr);
                }
            }

            console.log(`[GroupService] Successfully toggled live for ${groupId}`);
            return group;
        } catch (error) {
            console.error(`[GroupService] Error toggling live for ${groupId}:`, error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, `Failed to toggle session: ${error.message}`);
        }
    }
}

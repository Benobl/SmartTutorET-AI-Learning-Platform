import StudyGroup from "./group.model.js";
import Forum from "./forum.model.js";
import Thread from "./thread.model.js";
import Post from "./post.model.js";
import Invite from "./invite.model.js";
import { ApiError } from "../../middleware/error.middleware.js";
import { addStreamChannelMember } from "../../lib/stream.js";

export class GroupService {
    static async createGroup(creatorId, groupData) {
        const group = await StudyGroup.create({
            ...groupData,
            creator: creatorId,
            members: [creatorId]
        });

        // Automatically create a default forum for the group
        await Forum.create({
            groupId: group._id,
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
        let forums = await Forum.find({ groupId });
        if (forums.length === 0) {
            const group = await StudyGroup.findById(groupId);
            if (group) {
                const defaultForum = await Forum.create({
                    groupId: group._id,
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
        const group = await StudyGroup.findById(groupId);
        if (!group) throw new ApiError(404, "Group not found");

        // Only creator can toggle live status
        if (group.creator.toString() !== userId.toString()) {
            throw new ApiError(403, "Only the squad creator can start/stop live sessions");
        }

        group.isLive = isLive;
        group.sessionData = isLive ? sessionData : null;
        await group.save();
        return group;
    }
}

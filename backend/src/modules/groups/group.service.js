import StudyGroup from "./group.model.js";
import Forum from "./forum.model.js";
import Thread from "./thread.model.js";
import Post from "./post.model.js";
import Invite from "./invite.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class GroupService {
    static async createGroup(ownerId, groupData) {
        const group = await StudyGroup.create({
            ...groupData,
            owner: ownerId,
            members: [ownerId]
        });

        // Automatically create a default forum for the group
        await Forum.create({
            groupId: group._id,
            title: "General Discussion",
            description: `Welcome to the ${group.name} general forum.`
        });

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
        return await Forum.find({ groupId });
    }

    static async getForumThreads(forumId) {
        return await Thread.find({ forumId }).populate("author", "fullName profilePic");
    }

    static async getThreadPosts(threadId) {
        return await Post.find({ threadId }).populate("author", "fullName profilePic");
    }
}

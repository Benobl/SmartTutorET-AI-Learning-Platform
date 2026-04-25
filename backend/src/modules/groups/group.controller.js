import { GroupService } from "./group.service.js";

export class GroupController {
    static async create(req, res, next) {
        try {
            const group = await GroupService.createGroup(req.user._id, req.body);
            res.status(201).json(group);
        } catch (error) {
            next(error);
        }
    }

    static async join(req, res, next) {
        try {
            const group = await GroupService.addMember(req.params.groupId, req.user._id);
            res.json({ success: true, message: "Joined group successfully", data: group });
        } catch (error) {
            next(error);
        }
    }

    static async getForums(req, res, next) {
        try {
            const forums = await GroupService.getGroupForums(req.params.groupId);
            res.json({ success: true, data: forums });
        } catch (error) {
            next(error);
        }
    }

    static async createThread(req, res, next) {
        try {
            const thread = await GroupService.createThread(req.params.forumId, req.user._id, req.body);
            res.status(201).json({ success: true, data: thread });
        } catch (error) {
            next(error);
        }
    }

    static async getThreads(req, res, next) {
        try {
            const threads = await GroupService.getForumThreads(req.params.forumId);
            res.json({ success: true, data: threads });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const groups = await GroupService.getAllGroups();
            res.json(groups);
        } catch (error) {
            next(error);
        }
    }

    static async getMyGroups(req, res, next) {
        try {
            const groups = await GroupService.getUserGroups(req.user._id);
            res.json(groups);
        } catch (error) {
            next(error);
        }
    }
}

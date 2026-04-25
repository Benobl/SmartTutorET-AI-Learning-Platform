import { InviteService } from "./invite.service.js";

export class InviteController {
    static async send(req, res, next) {
        try {
            const invite = await InviteService.sendInvite(req.user._id, req.body);
            res.status(201).json(invite);
        } catch (error) {
            next(error);
        }
    }

    static async getMine(req, res, next) {
        try {
            const invites = await InviteService.getMyInvites(req.user._id);
            res.json(invites);
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

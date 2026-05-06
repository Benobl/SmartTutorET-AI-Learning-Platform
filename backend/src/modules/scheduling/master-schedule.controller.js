import { MasterScheduleService } from "./master-schedule.service.js";

export class MasterScheduleController {
    static async create(req, res, next) {
        try {
            const entry = await MasterScheduleService.createEntry(req.body);
            res.status(201).json({ success: true, data: entry });
        } catch (error) {
            next(error);
        }
    }

    static async getByGrade(req, res, next) {
        try {
            const { grade } = req.params;
            const { stream } = req.query;
            const data = await MasterScheduleService.getGradeSchedule(grade, stream);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const data = await MasterScheduleService.getAllSchedules();
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            await MasterScheduleService.deleteEntry(req.params.id);
            res.json({ success: true, message: "Entry removed from master schedule" });
        } catch (error) {
            next(error);
        }
    }
}

import MasterSchedule from "./master-schedule.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class MasterScheduleService {
    static async createEntry(data) {
        return await MasterSchedule.create(data);
    }

    static async getGradeSchedule(grade, stream) {
        const query = { grade };
        if (stream && stream !== "Common") {
            query.$or = [{ stream }, { stream: "Common" }];
        }
        return await MasterSchedule.find(query)
            .populate("subject", "title code")
            .populate("tutor", "name profile.avatar")
            .sort({ dayOfWeek: 1, startTime: 1 });
    }

    static async getAllSchedules() {
        return await MasterSchedule.find()
            .populate("subject", "title code")
            .populate("tutor", "name profile.avatar");
    }

    static async getTutorSchedule(tutorId) {
        return await MasterSchedule.find({ tutor: tutorId })
            .populate("subject", "title code")
            .populate("tutor", "name profile.avatar")
            .sort({ dayOfWeek: 1, startTime: 1 });
    }

    static async deleteEntry(id) {
        const entry = await MasterSchedule.findByIdAndDelete(id);
        if (!entry) throw new ApiError(404, "Schedule entry not found");
        return entry;
    }
}

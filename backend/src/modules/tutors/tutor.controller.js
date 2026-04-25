import { TutorService } from "./tutor.service.js";

export class TutorController {
    static async getJobs(req, res, next) {
        try {
            const jobs = await TutorService.getJobs();
            res.json({ success: true, data: jobs });
        } catch (error) {
            next(error);
        }
    }

    static async applyTutor(req, res, next) {
        try {
            const { jobId } = req.params;
            const { expertise, experience } = req.body;
            const application = await TutorService.applyTutor(req.user._id, jobId, expertise, experience);
            res.status(201).json({ success: true, message: "Application submitted successfully", data: application });
        } catch (error) {
            next(error);
        }
    }
}

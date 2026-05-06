import { AIService } from "./ai.service.js";

export class AIController {
    static async generateResponse(req, res, next) {
        try {
            const studentResponse = await AIService.generateTutorResponse(req.body);
            res.json({
                success: true,
                data: {
                    response: studentResponse,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getCourseOutline(req, res, next) {
        try {
            const { subject, grade } = req.body;
            const outline = await AIService.generateCourseOutline(subject, grade);
            res.json({ success: true, data: outline });
        } catch (error) {
            next(error);
        }
    }

    static async getSuggestions(req, res, next) {
        try {
            const { subject, grade } = req.body;
            const suggestions = await AIService.suggestResources(subject, grade);
            res.json({ success: true, data: suggestions });
        } catch (error) {
            next(error);
        }
    }

    static async generateGradeCurriculum(req, res, next) {
        try {
            const { grade, stream } = req.body;
            const curriculum = await AIService.generateFullCurriculum(grade, stream);
            res.json({ success: true, data: curriculum });
        } catch (error) {
            next(error);
        }
    }
    static async generateGradeSchedule(req, res, next) {
        try {
            const { grade, stream, subjects } = req.body;
            const schedule = await AIService.generateWeeklySchedule(grade, stream, subjects);
            res.json({ success: true, data: schedule });
        } catch (error) {
            next(error);
        }
    }
}

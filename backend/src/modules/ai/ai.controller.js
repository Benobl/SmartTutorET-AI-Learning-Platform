import { AIService } from "./ai.service.js";
import { TutorService } from "./tutor.service.js";
import { awardXP } from "../gamification/gamification.controller.js";

export class AIController {
    static async askTutor(req, res, next) {
        try {
            const { subject, query, historyId, attachments } = req.body;
            const result = await TutorService.getResponse({
                studentId: req.user._id,
                subject: subject || "General",
                query,
                historyId,
                attachments
            });

            // Award XP for AI Study Session (+20)
            await awardXP({
                user: req.user,
                body: { reason: "ai_study", metadata: { query: query.substring(0, 50) } }
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getChatHistory(req, res, next) {
        try {
            const { subject } = req.query;
            const history = await TutorService.getHistory(req.user._id, subject);
            res.json({ success: true, data: history });
        } catch (error) {
            next(error);
        }
    }

    static async auditSecurity(req, res, next) {
        try {
            const { code } = req.body;
            if (!code) return res.status(400).json({ success: false, message: "Code snippet is required" });

            const result = await AIService.auditCodeSecurity(code);
            if (!result) return res.status(500).json({ success: false, message: "Security audit failed" });

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async generateResponse(req, res, next) {
        try {
            const { question, studentQuery, context, conversationHistory, modelPreference } = req.body;
            const actualQuery = studentQuery || question;
            
            // Map the request body to the service expected format
            const studentResponse = await AIService.generateTutorResponse({
                studentQuery: actualQuery,
                performanceData: context ? { context } : null,
                conversationHistory,
                modelPreference: modelPreference || "llama"
            });
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
            const { subject, grade, outline } = req.body;
            const suggestions = await AIService.suggestResources(subject, grade, outline);
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

    static async generateStudyPlan(req, res, next) {
        try {
            const { grade, subjects } = req.body;
            const plan = await AIService.generateStudyPlan(grade, subjects);
            res.json({ success: true, data: plan });
        } catch (error) {
            next(error);
        }
    }

    static async getPerformanceInsights(req, res, next) {
        try {
            const insights = await AIService.getPerformanceInsights(req.user._id);
            res.json({ success: true, data: insights });
        } catch (error) {
            next(error);
        }
    }

    static async generatePublicResponse(req, res, next) {
        try {
            const { studentQuery, conversationHistory } = req.body;
            
            const response = await AIService.generateTutorResponse({
                studentQuery,
                performanceData: { context: "Landing Page Visitor" },
                conversationHistory,
                modelPreference: "llama"
            });

            res.json({
                success: true,
                data: {
                    response,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

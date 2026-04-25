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
}

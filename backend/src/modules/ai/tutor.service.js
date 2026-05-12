import OpenAI from "openai";
import dotenv from "dotenv";
import ChatSession from "./chat.model.js";
import axios from "axios";
import { AIService } from "./ai.service.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export class TutorService {
    /**
     * Core Tutoring Logic
     */
    static async getResponse({ studentId, subject, query, historyId = null, attachments = [] }) {
        try {
            // 1. Get or create session
            let session;
            if (historyId) {
                session = await ChatSession.findById(historyId);
            } else {
                session = await ChatSession.findOne({ student: studentId, subject, isArchived: false })
                    .sort({ updatedAt: -1 });
                
                if (!session) {
                    session = await ChatSession.create({ 
                        student: studentId, 
                        subject,
                        title: `Tutor Session: ${subject}`
                    });
                }
            }

            // 2. Build AI Context
            const messages = [
                {
                    role: "system",
                    content: `You are "SmartTutor AI", a professional, encouraging, and highly intelligent tutor for Ethiopian high school students (Grade 9-12).
                    
                    CURRICULUM CONTEXT:
                    - You follow the official Ethiopian Ministry of Education curriculum.
                    - Subject of focus: ${subject}.
                    - Languages: Support Amharic, Afaan Oromoo, and English. Respond in the language the student uses, or provide translations if helpful.
                    
                    PEDAGOGICAL STYLE:
                    - Don't just give answers. Guide the student to the answer using the Socratic method.
                    - Use metaphors and examples relevant to Ethiopian life (e.g., coffee farming, historical landmarks, local sports).
                    - If a student makes a mistake, explain the logic of why it was wrong in a kind way.
                    - Use LaTeX for mathematical formulas (e.g., $E = mc^2$).
                    - Use Markdown for structure.
                    
                    ADAPTIVE MEMORY:
                    - Current Subject: ${subject}
                    - Weak Topics: ${session.memory?.weakTopics?.join(", ") || "None identified yet"}.
                    
                    CAPABILITIES:
                    - You can read PDFs (text provided below).
                    - You can "see" images (provided via Vision).
                    - You can help with homework, explain complex topics, and generate practice quizzes.`
                }
            ];

            // 3. Add History (Last 10 messages for token optimization)
            const recentHistory = session.messages.slice(-10).map(msg => ({
                role: msg.role,
                content: msg.content
            }));
            messages.push(...recentHistory);

            // 4. Handle Attachments
            let multimodalContent = [{ type: "text", text: query }];

            for (const attachment of attachments) {
                if (attachment.type === "image") {
                    multimodalContent.push({
                        type: "image_url",
                        image_url: { url: attachment.url }
                    });
                } else if (attachment.type === "pdf") {
                    const pdfText = await this._parsePdf(attachment.url);
                    messages.push({
                        role: "system",
                        content: `CONTEXT FROM UPLOADED PDF (${attachment.name}):\n\n${pdfText.slice(0, 5000)}` // Limit to 5k chars
                    });
                }
            }

            messages.push({ role: "user", content: multimodalContent });

            // 5. Call the Neural Core (Llama-3 / Gemini / Mistral)
            const aiResponse = await AIService.generateTutorResponse({
                studentQuery: query,
                performanceData: { 
                    subject, 
                    weakTopics: session.memory?.weakTopics,
                    pdfContext: attachments.filter(a => a.type === "pdf").length > 0 
                },
                conversationHistory: recentHistory,
                modelPreference: "llama" // This triggers our hardened triple-redundant pipeline
            });

            // 6. Update Session History
            session.messages.push({ role: "user", content: query });
            session.messages.push({ role: "assistant", content: aiResponse });
            
            // 7. Extract learning memory (Optional: simple heuristic)
            if (aiResponse.toLowerCase().includes("struggling") || aiResponse.toLowerCase().includes("difficult")) {
                // Heuristic to detect weak topics
                const topics = query.split(" ").slice(0, 3).join(" ");
                if (!session.memory.weakTopics.includes(topics)) {
                    session.memory.weakTopics.push(topics);
                }
            }

            await session.save();

            return {
                response: aiResponse,
                sessionId: session._id,
                history: session.messages.slice(-5)
            };

        } catch (error) {
            console.error("AI Tutor Service Error:", error);
            throw error;
        }
    }

    static async _parsePdf(url) {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const data = await pdf(response.data);
            return data.text;
        } catch (error) {
            console.error("PDF Parsing Error:", error);
            return "[Error reading PDF]";
        }
    }

    static async getHistory(studentId, subject) {
        return await ChatSession.find({ student: studentId, subject })
            .sort({ updatedAt: -1 })
            .limit(5);
    }
}

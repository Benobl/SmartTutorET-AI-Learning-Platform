import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class AIService {
    static async generateTutorResponse({ studentQuery, performanceData, conversationHistory }) {
        const dataContext = performanceData
            ? `Student Performance Data: ${JSON.stringify(performanceData)}`
            : "Student Performance Data: No data available yet (New Student).";

        let conversationContext = "";
        if (conversationHistory && conversationHistory.length > 0) {
            conversationContext = "\n\nPrevious Conversation:\n";
            conversationHistory.forEach((msg) => {
                conversationContext += `${msg.role === "user" ? "Student" : "AI Tutor"}: ${msg.content}\n`;
            });
        }

        const prompt = `You are an expert AI Tutor for Ethiopian high school students (Grades 9-12). You are knowledgeable, patient, encouraging, and adapt your explanations to the student's level.

${dataContext}
${conversationContext}

Current Student Query: ${studentQuery}

Instructions:
1. If performance data shows weak areas, tailor your explanation to address those gaps
2. If no performance data, provide a clear, structured explanation suitable for high school level
3. Use simple language and provide examples relevant to Ethiopian students
4. Break down complex concepts into digestible parts
5. Encourage critical thinking with follow-up questions
6. If the student seems confused, offer to explain in a different way
7. Always be supportive and motivating
8. For math/science, show step-by-step solutions when appropriate
9. Suggest practice exercises or study tips when relevant
10. Keep responses concise but comprehensive (aim for 150-300 words)

Format your response in a clear, structured way using markdown formatting when helpful.`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
}

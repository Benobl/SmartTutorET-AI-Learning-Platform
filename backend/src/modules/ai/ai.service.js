import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { ETHIOPIAN_CURRICULUM } from "./local-curriculum.js";

dotenv.config();

const getGenAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "your_gemini_api_key_here") {
        console.error("❌ GEMINI_API_KEY is not set or still has placeholder value");
    } else {
        console.log(`✅ GEMINI_API_KEY detected: ${key.substring(0, 6)}...${key.substring(key.length - 4)}`);
    }
    return new GoogleGenerativeAI(key);
};

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

        const model = getGenAI().getGenerativeModel({
            model: "models/gemini-2.5-flash",
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    static async generateCourseOutline(subject, grade) {
        const model = getGenAI().getGenerativeModel({ model: "models/gemini-2.5-flash" });
        const prompt = `Act as an Ethiopian Curriculum Expert. Create a detailed course syllabus/outline for a Grade ${grade} course on "${subject}". 
        Include:
        1. 5-8 Main Modules
        2. 3-4 specific learning objectives for each module
        3. A brief introduction
        Return the result in clear markdown format.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    static async suggestResources(subject, grade) {
        const model = getGenAI().getGenerativeModel({ model: "models/gemini-2.5-flash" });
        const prompt = `Suggest high-quality educational resources for a Grade ${grade} student studying "${subject}" in Ethiopia. 
        Include:
        1. Open-source textbooks (like Ministry of Education books)
        2. Educational YouTube channels
        3. Specific websites for practice (e.g., Khan Academy, local exam prep sites)
        4. Mobile apps helpful for this subject.
        Return as a structured list with brief descriptions of why each resource is helpful.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    static async generateFullCurriculum(grade, stream) {
        const modelsToTry = [
            "models/gemini-2.5-flash", 
            "models/gemini-2.5-pro", 
            "models/gemini-2.0-flash", 
            "models/gemini-2.0-flash-lite"
        ];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`📡 Attempting curriculum generation with model: ${modelName}...`);
                const model = getGenAI().getGenerativeModel({ 
                    model: modelName, 
                    generationConfig: { response_mime_type: "application/json" } 
                });
                
                const streamInfo = (grade === "11" || grade === "12") ? `for the ${stream} stream` : "";
                const prompt = `Act as an Ethiopian Ministry of Education Curriculum Expert. 
                Generate a complete list of official high school subjects for Grade ${grade} ${streamInfo}.
                
                For each subject, provide:
                1. Official Title
                2. Course Code (e.g., BIO-G9)
                3. A brief description (focusing on what's in the official textbook)
                4. A yearly roadmap divided into Semester 1 and Semester 2.
                5. Semester 1: Chapters covered (e.g., "1, 2, 3"), estimated Mid-term and Final dates.
                6. Semester 2: Chapters covered (e.g., "4, 5, 6"), estimated Mid-term and Final dates.

                Return ONLY a JSON array of objects with this schema:
                [
                  {
                    "title": "Subject Title",
                    "code": "CODE",
                    "description": "...",
                    "grade": "${grade}",
                    "stream": "${stream}",
                    "roadmap": {
                      "semester1": { "chapters": "...", "midTerm": "2024-11-15", "final": "2025-01-20" },
                      "semester2": { "chapters": "...", "midTerm": "2025-04-10", "final": "2025-06-15" }
                    }
                  }
                ]`;

                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                console.log(`✅ Successfully generated curriculum using ${modelName}`);
                return JSON.parse(responseText);
            } catch (error) {
                console.warn(`⚠️ Model ${modelName} failed:`, error.message);
                lastError = error;
            }
        }
        
        // Final Fallback: Local Curriculum
        console.warn("🚀 All AI models failed. Using local Ethiopian curriculum fallback...");
        const key = grade === "11" || grade === "12" ? `${grade}_${stream}` : grade;
        return ETHIOPIAN_CURRICULUM[key] || ETHIOPIAN_CURRICULUM["9"];
    }

    static async generateWeeklySchedule(grade, stream, subjects) {
        const modelsToTry = [
            "models/gemini-2.5-flash",
            "models/gemini-2.0-flash",
            "models/gemini-1.5-flash",
            "models/gemini-2.5-pro"
        ];
        
        const prompt = `Act as an Ethiopian High School Registrar. Create a comprehensive, realistic weekly school timetable (Monday to Friday) for Grade ${grade} ${stream}.
        
        Use the following subjects available in our curriculum: ${subjects.map(s => s.title).join(", ")}.
        
        CRITICAL RULES:
        1. You MUST create EXACTLY 20 slots in total (4 slots per day for 5 days). Do not skip any days or slots.
        2. The exact time slots for every day are: "08:30", "10:30", "13:30", and "15:30".
        3. The exact end times for every day are: "10:00", "12:00", "15:00", and "17:00".
        4. Distribute the provided subjects evenly and logically throughout the week. Hard subjects (like Math/Physics) are better in the morning.
        5. No single subject should dominate the schedule; ensure a balanced academic week.
        
        Return ONLY a JSON array of objects with this exact schema:
        [
          {
            "dayOfWeek": "Monday",
            "startTime": "08:30",
            "endTime": "10:00",
            "subjectTitle": "..."
          }
        ]`;

        for (const modelName of modelsToTry) {
            try {
                console.log(`📡 Attempting schedule generation with model: ${modelName}...`);
                const model = getGenAI().getGenerativeModel({ 
                    model: modelName, 
                    generationConfig: { response_mime_type: "application/json" } 
                });
                
                const result = await model.generateContent(prompt);
                console.log(`✅ Successfully generated schedule using ${modelName}`);
                return JSON.parse(result.response.text());
            } catch (error) {
                console.warn(`⚠️ Model ${modelName} failed for schedule generation:`, error.message);
            }
        }
        
        console.warn("🚀 All AI models failed due to quota/rate limits. Using static fallback schedule algorithm...");
        
        // Static fallback if all AI models fail
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const timeSlots = [
            { startTime: "08:30", endTime: "10:00" },
            { startTime: "10:30", endTime: "12:00" },
            { startTime: "13:30", endTime: "15:00" },
            { startTime: "15:30", endTime: "17:00" }
        ];
        
        const fallbackSchedule = [];
        let subjectIndex = 0;
        
        if (subjects && subjects.length > 0) {
            for (const day of days) {
                for (const slot of timeSlots) {
                    fallbackSchedule.push({
                        dayOfWeek: day,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        subjectTitle: subjects[subjectIndex % subjects.length].title
                    });
                    subjectIndex++;
                }
            }
        }
        
        return fallbackSchedule;
    }
}

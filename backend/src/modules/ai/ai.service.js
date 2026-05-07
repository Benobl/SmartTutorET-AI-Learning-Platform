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
            model: "gemini-1.5-flash",
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    static async generateCourseOutline(subject, grade) {
        const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });
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
        const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });
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
            "gemini-1.5-flash", 
            "gemini-1.5-pro"
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
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ];
        
        const prompt = `Act as an Ethiopian High School Registrar. Create a high-quality, professional weekly school timetable (Monday to Friday) for Grade ${grade} ${stream}.
        
        Available Subjects: ${subjects.map(s => s.title).join(", ")}.
        
        CRITICAL ARCHITECTURAL RULES:
        1. You MUST generate EXACTLY 20 slots (4 slots per day, 5 days/week). This guarantees a maximum of 4 hours of learning per day to maximize student focus.
        2. Daily Time Slots MUST strictly be: 08:30-09:30, 10:00-11:00, 11:30-12:30, 14:00-15:00. These specific times include generous structured breaks.
        3. CURRICULUM LOGIC:
           - If Grade 11 or 12: Heavily prioritize the ${stream} stream subjects.
           - If Grade 9 or 10: Distribute the core 6-7 subjects evenly across the week.
        4. SUBJECT PRIORITY: Math, English, and Physics MUST have at least 3 slots each per week.
        5. PEDAGOGY: Place intensive core subjects (Math, Physics, Biology, Chemistry) in the 08:30 and 10:00 morning slots when students are most alert.
        6. NO GAPS: Every single day MUST have exactly 4 subjects assigned.
        
        Return ONLY a JSON array of objects with this schema:
        [
          {
            "dayOfWeek": "Monday",
            "startTime": "08:30",
            "endTime": "09:30",
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

    static async generateStudyPlan(grade, subjects) {
        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ];
        
        const subjectList = Array.isArray(subjects) ? subjects.map(s => s.title || s.name || s).join(", ") : subjects;
        
        const prompt = `Act as an expert Educational Psychologist. Create a personalized, highly effective weekly after-school Study Plan (Monday to Friday) for a Grade ${grade} student.
        
        Current Subjects: ${subjectList}.
        
        CRITICAL RULES:
        1. NO CONFLICTS: Academic school hours are 08:30 to 15:00. DO NOT schedule any study sessions during this time.
        2. TIMING: Only schedule sessions in the late afternoon or evening (e.g., 16:00-17:00, 18:00-19:00, 20:00-21:00).
        3. DURATION: Each session should be exactly 1 hour long.
        4. CATEGORIES: Each session must be assigned one of the following exact categories: "Reading", "Homework", "Question Practice", or "Review".
        5. QUANTITY: Generate exactly 2 study sessions per day (Total: 10 sessions for the week).
        6. PEDAGOGY: Mix subjects to prevent burnout. Do not schedule the same subject twice in one day.
        
        Return ONLY a JSON array of objects with this exact schema:
        [
          {
            "dayOfWeek": "Monday",
            "startTime": "16:00",
            "endTime": "17:00",
            "title": "Subject Name",
            "category": "Reading"
          }
        ]`;

        for (const modelName of modelsToTry) {
            try {
                console.log(`📡 Attempting study plan generation with model: ${modelName}...`);
                const model = getGenAI().getGenerativeModel({ 
                    model: modelName, 
                    generationConfig: { response_mime_type: "application/json" } 
                });
                
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                // Strip markdown code blocks if present
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                const cleanJson = jsonMatch ? jsonMatch[0] : text;
                
                console.log(`✅ Successfully generated study plan using ${modelName}`);
                return JSON.parse(cleanJson);
            } catch (error) {
                console.warn(`⚠️ Model ${modelName} failed for study plan generation:`, error.message);
            }
        }
        
        // Static fallback
        return [
            { dayOfWeek: "Monday", startTime: "16:00", endTime: "17:00", title: "Mathematics", category: "Question Practice" },
            { dayOfWeek: "Monday", startTime: "18:00", endTime: "19:00", title: "Physics", category: "Review" },
            { dayOfWeek: "Tuesday", startTime: "16:00", endTime: "17:00", title: "Chemistry", category: "Homework" },
            { dayOfWeek: "Tuesday", startTime: "18:00", endTime: "19:00", title: "Biology", category: "Reading" },
            { dayOfWeek: "Wednesday", startTime: "16:00", endTime: "17:00", title: "English", category: "Reading" },
            { dayOfWeek: "Wednesday", startTime: "18:00", endTime: "19:00", title: "Mathematics", category: "Review" }
        ];
    }

    static async generateQuiz(subject, grade, topic, count = 5) {
        // [REF: QUIZ_GEN_V2]
        const modelsToTry = [
            "gemini-1.5-flash-latest", 
            "gemini-1.5-flash", 
            "gemini-1.5-pro-latest", 
            "gemini-pro"
        ];
        let lastError = null;

        console.log(`🚀 [AI_QUIZ] Starting generation for: ${topic} (${subject}, Grade ${grade})`);

        for (const modelName of modelsToTry) {
            try {
                console.log(`🔍 [AI_QUIZ] Attempting with model: ${modelName}...`);
                const genAI = getGenAI();
                const model = genAI.getGenerativeModel({ 
                    model: modelName
                });

                const prompt = `Act as an Ethiopian High School Exam Preparer. Create a high-quality Multiple Choice Quiz for Grade ${grade} on the topic "${topic}" within the subject "${subject}".
                
                Rules:
                1. Generate exactly ${count} questions.
                2. Each question must have 4 options.
                3. Questions should be aligned with the Ethiopian national curriculum level.
                4. Include clear, unambiguous correct answers.
                
                Return ONLY a JSON array with this schema:
                [
                  {
                    "question": "Question text here?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "The exact string from options that is correct",
                    "marks": 1
                  }
                ]
                
                IMPORTANT: Return ONLY the JSON array. Do not include markdown formatting or explanations.`;

                const result = await model.generateContent(prompt);
                let text = result.response.text();
                
                if (!text) throw new Error("Empty response from AI");
                
                // Clean markdown if present
                text = text.replace(/```json/g, "").replace(/```/g, "").trim();
                
                const questions = JSON.parse(text);
                console.log(`✅ [AI_QUIZ] Successfully generated ${questions.length} questions using ${modelName}`);
                return questions;
            } catch (error) {
                console.error(`❌ [AI_QUIZ] Model ${modelName} failed:`, error.message);
                lastError = error;
                // Continue to next model
            }
        }
        
        console.error(`💥 [AI_QUIZ] All models failed for topic: ${topic}`);
        throw new Error(`AI Quiz generation failed. Last error: ${lastError?.message}`);
    }
}

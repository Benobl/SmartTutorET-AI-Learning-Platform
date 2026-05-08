import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import axios from "axios";
import { ETHIOPIAN_CURRICULUM } from "./local-curriculum.js";

dotenv.config();

const getGenAI = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "your_gemini_api_key_here") {
        console.error("❌ GEMINI_API_KEY is not set or still has placeholder value");
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

    static async suggestResources(subject, grade, outline = "") {
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro"];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const prompt = `Research and suggest 3 high-quality YouTube masterclass videos and 1 digital textbook for a Grade ${grade} student studying "${subject}" in Ethiopia. 

                CRITICAL CONTEXT: The student is specifically studying ${subject} for Grade ${grade}. All resources MUST be about ${subject}.

                CRITICAL REQUIREMENTS:
                1. PRIMARY SOURCES: Prioritize links from these domains:
                   - English: https://learn-english.moe.gov.et/
                   - Science/General: https://leadstaracademy.com/
                2. Find REAL, SPECIFIC YouTube links (e.g., https://www.youtube.com/watch?v=VIDEO_ID). 
                3. BOOK URL: If an official portal link is unavailable, use a high-quality search query that targets PDFs (e.g., https://www.google.com/search?q=Grade+${grade}+${encodeURIComponent(subject)}+Ethiopian+Textbook+pdf).
                4. Languages: Amharic, Afaan Oromo, and English.
                
                Return ONLY a JSON object with this schema:
                {
                  "videos": [
                    { "title": "...", "language": "Amharic", "url": "https://youtu.be/..." },
                    { "title": "...", "language": "Afaan Oromo", "url": "https://youtu.be/..." },
                    { "title": "...", "language": "English", "url": "https://youtu.be/..." }
                  ],
                  "books": [
                    { "title": "Grade ${grade} ${subject} Digital Textbook", "type": "Digital Reference", "url": "..." }
                  ]
                }`;

                const model = getGenAI().getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                let text = result.response.text();
                text = text.replace(/```json/g, "").replace(/```/g, "").trim();
                return JSON.parse(text);
            } catch (error) {
                console.error(`⚠️ Resource suggestion failed with ${modelName}:`, error.message);
                lastError = error;
            }
        }

        // Real Fallback (Search Link) instead of static
        const safeSubject = subject || "Educational";
        const safeGrade = grade || "";
        
        return {
            videos: [
                { title: `Mastering Grade ${safeGrade} ${safeSubject} - Ethiopian Curriculum`, language: "English", url: `https://www.youtube.com/results?search_query=Grade+${safeGrade}+${encodeURIComponent(safeSubject)}+Ethiopia+Curriculum` }
            ],
            books: [
                { title: `Official Grade ${safeGrade} ${safeSubject} Textbook`, type: "MoE Portal", url: `http://213.55.93.9/index.php/s/search?q=${encodeURIComponent(safeSubject)}+Grade+${safeGrade}` }
            ]
        };
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

    static _sanitizeTopic(raw) {
        // Strip common re-generate phrases and "AI Generated:" prefix
        return raw
            .replace(/^AI Generated:\s*/i, "")
            .replace(/Topic:\s*/i, "")
            .replace(/\.\s*Please generate different questions for the same topic\.?/gi, "")
            .replace(/Please generate.*$/gi, "")
            .trim();
    }

    static _buildFallbackQuestions(topic, subject, grade, count) {
        const subjectLower = subject.toLowerCase();
        const topicLower = topic.toLowerCase();

        // Extract potential terms for better question framing
        const terms = topic.split(" ").filter(t => t.length > 3);
        const term1 = terms[0] || topic;
        const term2 = terms[1] || term1;

        // Detect subject category
        const isMath = /math|algebra|geometry|calculus|arithmetic|statistic|trigonometry/.test(subjectLower);
        const isScience = /bio|physics|chemistry|science/.test(subjectLower);

        let templates = [];

        if (isMath) {
            templates = [
                { q: `In Grade ${grade} ${subject}, which property of ${term1} is most fundamental?`, opts: [`The linear relationship between variables`, `Its atomic weight`, `Its historical context in Ethiopia`, `The color of the graph`], correct: 0 },
                { q: `When solving an equation involving ${topic}, what is the value of 'x' if the result must be a natural number?`, opts: [`It depends on the specific coefficients of the ${term1}`, `It is always zero`, `It must be a negative integer`, `It cannot be determined`], correct: 0 },
                { q: `Which of the following formulas is MOST associated with ${topic}?`, opts: [`The standard formula for ${term1} taught in Grade ${grade}`, `E = mc²`, `The quadratic formula for unrelated equations`, `The area of a circle`], correct: 0 },
                { q: `A student is asked to simplify an expression containing ${term2}. Which rule should they apply FIRST?`, opts: [`Order of operations (BODMAS) relevant to ${term1}`, `Newton's Second Law`, `The periodic table rules`, `Grammar rules`], correct: 0 },
                { q: `If the graph of ${topic} is a straight line, what does this tell us about the relationship?`, opts: [`It is a linear relationship`, `It is exponential`, `It is inversely proportional to gravity`, `The relationship is random`], correct: 0 }
            ];
        } else if (isScience) {
            templates = [
                { q: `Which of the following is a PRIMARY characteristic of ${term1} in ${subject}?`, opts: [`Its specific structure and function within the system`, `Its price in the global market`, `Its ability to solve quadratic equations`, `Its historical date of discovery`], correct: 0 },
                { q: `How does ${topic} interact with other components in a Grade ${grade} experiment?`, opts: [`Through specific chemical or physical interactions unique to ${term2}`, `By changing the language of the report`, `It has no interaction at all`, `It turns into a mathematical constant`], correct: 0 },
                { q: `What is the significance of ${topic} in the Ethiopian curriculum?`, opts: [`It builds foundational scientific knowledge for national exams`, `It is only used for university research`, `It was removed from the syllabus recently`, `It is a social science topic`], correct: 0 },
                { q: `If a scientist observes a change in ${term1}, what is the most likely cause?`, opts: [`An external factor influencing ${term2}`, `A mathematical error in the calendar`, `A change in the government policy`, `The observer's favorite color`], correct: 0 },
                { q: `Which tool is essential for studying ${topic} in a laboratory setting?`, opts: [`Instruments specific to ${subject} (e.g., microscope, scale, test tube)`, `A calculator and nothing else`, `A map of the world`, `A dictionary`], correct: 0 }
            ];
        }

        // Add variety
        const universal = [
            { q: `Analyze the following statement about ${topic}: "${term1} is essential for Grade ${grade} success."`, opts: [`True, as it forms a core part of the ${subject} syllabus`, `False, it is an optional extra`, `Only true for students in Addis Ababa`, `Only true for Grade 12 students`], correct: 0 },
            { q: `Which misconception is common when students FIRST learn about ${topic}?`, opts: [`Confusing ${term1} with similar but different concepts in ${subject}`, `Thinking ${term2} is a type of food`, `Believing it was discovered by Isaac Newton`, `Assuming it has no marks in the exam`], correct: 0 }
        ];

        const combined = [...templates, ...universal].sort(() => Math.random() - 0.5);
        const selected = combined.slice(0, Math.min(count, combined.length));

        return selected.map(t => ({
            question: t.q,
            options: t.opts.sort(() => Math.random() - 0.5), // Shuffle options too
            correctAnswer: t.opts[t.correct],
            explanation: `Based on the Grade ${grade} curriculum for ${subject}, ${t.opts[t.correct]} is the verified answer for this topic.`,
            marks: 1
        }));
    }

    static async generateQuiz(subject, grade, rawTopic, count = 5) {
        // Always sanitize the topic first to remove re-generate junk
        const topic = AIService._sanitizeTopic(rawTopic);

        const modelsToTry = [
            "gemini-1.5-flash", 
            "gemini-1.5-pro",
            "gemini-1.5-flash-8b"
        ];
        let lastError = null;

        console.log(`🚀 [AI_QUIZ] Starting generation for: "${topic}" (${subject}, Grade ${grade})`);

        const apiKey = (process.env.GEMINI_API_KEY || "").trim();

        for (const modelName of modelsToTry) {
            // Try both v1beta and v1
            for (const apiVersion of ["v1beta", "v1"]) {
                try {
                    console.log(`🔍 [AI_QUIZ] Attempting: ${modelName} (${apiVersion})...`);
                    
                    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;

                    const prompt = `You are an elite Ethiopian National Exam preparer for ${subject}, Grade ${grade}.
                
Create ${count} high-level, challenging multiple-choice questions about the topic: "${topic}".

STRICT PEDAGOGICAL REQUIREMENTS:
1. DEPTH: No simple definitions. Focus on analysis.
2. CALCULATIONS: For Math/Physics, include multi-step calculations with real formulas.
3. TRICK QUESTIONS: Include tricky distractors that catch common misconceptions.
4. VARIETY: Mix conceptual questions with practical case studies.

Return ONLY a JSON array.

JSON format:
[
  {
    "question": "Detailed question...",
    "options": ["Correct Answer", "Distractor A", "Distractor B", "Distractor C"],
    "correctAnswer": "Correct Answer",
    "explanation": "A clear, concise explanation of WHY this answer is correct, referencing relevant concepts.",
    "marks": 1
  }
]`;

                    const response = await axios.post(url, {
                        contents: [{ parts: [{ text: prompt }] }]
                    }, { timeout: 15000 });

                    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                        let text = response.data.candidates[0].content.parts[0].text;
                        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
                        const questions = JSON.parse(text);
                        console.log(`✅ [AI_QUIZ] Success with ${modelName} (${apiVersion})`);
                        return questions;
                    }
                } catch (error) {
                    const status = error.response?.status;
                    const msg = error.response?.data?.error?.message || error.message;
                    console.error(`❌ [AI_QUIZ] Failed ${modelName} (${apiVersion}): ${status} - ${msg}`);
                    lastError = new Error(msg);
                }
            }
        }
        
        console.warn(`⚠️ [AI_QUIZ] All AI models failed. Last Error: ${lastError?.message}`);
        return AIService._buildFallbackQuestions(topic, subject, grade, count);
    }
}

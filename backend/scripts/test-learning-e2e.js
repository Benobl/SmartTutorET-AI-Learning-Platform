import axios from "axios";
import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/modules/users/user.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5001/api";
const LEARNING_BASE = `${API_BASE_URL}/v2/learning`;

const TUTOR_EMAIL = "e2e.tutor@smarttutor.local";
const TUTOR_PASSWORD = "TutorPass123!";
const STUDENT_EMAIL = "e2e.student@smarttutor.local";
const STUDENT_PASSWORD = "StudentPass123!";

const logStep = (name, payload) => {
  console.log(`\n✅ ${name}`);
  if (payload !== undefined) {
    console.log(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  }
};

const assertOk = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function ensureUser({ email, password, role, name }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password,
      role,
      isApproved: true,
      isVerified: true,
      tutorStatus: role === "tutor" ? "approved" : "none",
    });
    return user;
  }
  user.password = password;
  user.role = role;
  user.isApproved = true;
  user.isVerified = true;
  user.tutorStatus = role === "tutor" ? "approved" : "none";
  await user.save();
  return user;
}

async function login(email, password) {
  const response = await axios.post(
    `${API_BASE_URL}/auth/login`,
    { email, password },
    { headers: { "X-Requested-With": "XMLHttpRequest" } },
  );
  assertOk(response.data?.token, `Login failed for ${email}`);
  return response.data.token;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4, serverSelectionTimeoutMS: 10000 });

    await ensureUser({
      email: TUTOR_EMAIL,
      password: TUTOR_PASSWORD,
      role: "tutor",
      name: "E2E Tutor",
    });
    await ensureUser({
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD,
      role: "student",
      name: "E2E Student",
    });
    logStep("Seeded test tutor/student users");

    const tutorToken = await login(TUTOR_EMAIL, TUTOR_PASSWORD);
    const tutorHeaders = {
      Authorization: `Bearer ${tutorToken}`,
      "X-Requested-With": "XMLHttpRequest",
    };
    logStep("Tutor login succeeded");

    const coursePayload = {
      title: `E2E Course ${Date.now()}`,
      description: "End-to-end generated course for API verification.",
    };
    const courseRes = await axios.post(`${LEARNING_BASE}/courses`, coursePayload, { headers: tutorHeaders });
    const course = courseRes.data?.data;
    assertOk(course?._id, "Course creation failed");
    logStep("Created course", { courseId: course._id, title: course.title });

    const modulePayload = {
      title: "Module 1: Foundations",
      order: 1,
      notes: "Core concepts and orientation notes.",
      videoUrl: "https://example.com/videos/foundations.mp4",
      resources: ["https://example.com/resources/foundations.pdf"],
    };
    const moduleRes = await axios.post(`${LEARNING_BASE}/courses/${course._id}/modules`, modulePayload, { headers: tutorHeaders });
    const moduleData = moduleRes.data?.data;
    assertOk(moduleData?._id, "Module creation failed");
    logStep("Created module", { moduleId: moduleData._id, title: moduleData.title });

    const quizPayload = {
      title: "Module 1 Quiz",
      courseId: course._id,
      moduleId: moduleData._id,
      questions: [
        {
          question: "2 + 2 = ?",
          type: "mcq",
          options: ["3", "4", "5"],
          correctAnswer: "4",
          marks: 10,
        },
        {
          question: "Write one study goal.",
          type: "short_answer",
          options: [],
          correctAnswer: "Any",
          marks: 5,
        },
      ],
    };
    const quizRes = await axios.post(`${LEARNING_BASE}/quiz/create`, quizPayload, { headers: tutorHeaders });
    const quiz = quizRes.data?.data;
    assertOk(quiz?._id, "Quiz creation failed");
    logStep("Created quiz", { quizId: quiz._id, questionCount: quiz.questions?.length });

    const studentToken = await login(STUDENT_EMAIL, STUDENT_PASSWORD);
    const studentHeaders = {
      Authorization: `Bearer ${studentToken}`,
      "X-Requested-With": "XMLHttpRequest",
    };
    logStep("Student login succeeded");

    await axios.post(`${LEARNING_BASE}/courses/${course._id}/enroll`, {}, { headers: studentHeaders });
    logStep("Student enrolled in course", { courseId: course._id });

    const myCourses = await axios.get(`${LEARNING_BASE}/courses`, { headers: studentHeaders });
    assertOk(Array.isArray(myCourses.data?.data), "Failed to fetch enrolled courses");
    logStep("Fetched student courses", { enrolledCourses: myCourses.data.data.length });

    const courseDetailsRes = await axios.get(`${LEARNING_BASE}/courses/${course._id}`, { headers: studentHeaders });
    const quizQuestions = courseDetailsRes.data?.data?.modules?.[0]?.quizId?.questions || [];
    assertOk(quizQuestions.length >= 2, "Course detail missing quiz questions");
    logStep("Fetched course details with structured materials");

    const answers = quizQuestions.map((q) => ({
      questionId: q._id,
      studentAnswer: q.type === "mcq" ? "4" : "My learning goal is to master algebra.",
    }));
    const submitRes = await axios.post(`${LEARNING_BASE}/quiz/${quiz._id}/submit`, { answers }, { headers: studentHeaders });
    assertOk(submitRes.data?.data?.attempt?._id, "Quiz submission failed");
    logStep("Student submitted quiz", {
      attemptId: submitRes.data.data.attempt._id,
      autoScore: submitRes.data.data.attempt.score,
    });

    const gradePayload = {
      courseId: course._id,
      quizId: quiz._id,
      score: 92,
      feedback: "Excellent performance and clear response.",
    };
    const gradeRes = await axios.post(
      `${LEARNING_BASE}/grade/student/${submitRes.data.data.result.studentId || (await User.findOne({ email: STUDENT_EMAIL }))._id}`,
      gradePayload,
      { headers: tutorHeaders },
    );
    assertOk(gradeRes.data?.data?.grade === "A", "Manual grading did not produce expected grade");
    logStep("Tutor graded student and ranking recalculated", {
      score: gradeRes.data.data.score,
      grade: gradeRes.data.data.grade,
      rank: gradeRes.data.data.rankPosition,
    });

    const resultsRes = await axios.get(`${LEARNING_BASE}/results`, { headers: studentHeaders });
    assertOk(Array.isArray(resultsRes.data?.data?.results), "Results endpoint failed");
    logStep("Student fetched results", {
      quizResults: resultsRes.data.data.results.length,
      totals: resultsRes.data.data.totals,
    });

    const progressRes = await axios.get(`${LEARNING_BASE}/progress`, { headers: studentHeaders });
    assertOk(Array.isArray(progressRes.data?.data), "Progress endpoint failed");
    logStep("Student fetched progress", progressRes.data.data);

    console.log("\n🎉 Learning API E2E test completed successfully.");
    process.exit(0);
  } catch (error) {
    const payload = error.response?.data || error.message;
    console.error("\n❌ Learning API E2E test failed.");
    console.error(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  }
}

run();

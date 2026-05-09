const fs = require('fs');
const path = require('path');

const learningDir = path.join(__dirname, 'src', 'modules', 'learning');
if (!fs.existsSync(learningDir)) {
  fs.mkdirSync(learningDir, { recursive: true });
}

const files = {
  'course.model.js': `import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "CourseModule" }]
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);`,

  'courseModule.model.js': `import mongoose from "mongoose";

const courseModuleSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  contents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Content" }],
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }
}, { timestamps: true });

export default mongoose.model("CourseModule", courseModuleSchema);`,

  'content.model.js': `import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "CourseModule", required: true },
  type: { type: String, enum: ["video", "pdf", "notes", "resource"], required: true },
  url: { type: String },
  text: { type: String },
  title: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Content", contentSchema);`,

  'quiz.model.js': `import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "CourseModule" },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }]
}, { timestamps: true });

export default mongoose.model("Quiz", quizSchema);`,

  'question.model.js': `import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ["mcq", "short_answer"], required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  marks: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model("Question", questionSchema);`,

  'attempt.model.js': `import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" }
}, { timestamps: true });

export default mongoose.model("Attempt", attemptSchema);`,

  'submission.model.js': `import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "Attempt", required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  studentAnswer: { type: String, required: true },
  isCorrect: { type: Boolean },
  marksAwarded: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);`,

  'result.model.js': `import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  score: { type: Number, required: true },
  grade: { type: String, enum: ["A", "B", "C", "D", "F"] },
  feedback: { type: String },
  rankPosition: { type: Number }
}, { timestamps: true });

export default mongoose.model("Result", resultSchema);`,

  'learning.controller.js': `import Course from "./course.model.js";
import CourseModule from "./courseModule.model.js";
import Content from "./content.model.js";
import Quiz from "./quiz.model.js";
import Question from "./question.model.js";
import Attempt from "./attempt.model.js";
import Submission from "./submission.model.js";
import Result from "./result.model.js";

export const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = new Course({ title, description, tutorId: req.user._id });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, order } = req.body;
    const courseModule = new CourseModule({ courseId: id, title, order });
    await courseModule.save();
    
    await Course.findByIdAndUpdate(id, { $push: { modules: courseModule._id } });
    
    res.status(201).json(courseModule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const { title, courseId, moduleId, questions } = req.body;
    const quiz = new Quiz({ title, courseId, moduleId });
    await quiz.save();
    
    if (questions && questions.length > 0) {
      const createdQuestions = await Promise.all(questions.map(q => {
        return new Question({ ...q, quizId: quiz._id }).save();
      }));
      quiz.questions = createdQuestions.map(q => q._id);
      await quiz.save();
    }
    
    if (moduleId) {
      await CourseModule.findByIdAndUpdate(moduleId, { quizId: quiz._id });
    }
    
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const gradeStudent = async (req, res) => {
  try {
    const { id } = req.params; // studentId
    const { courseId, quizId, score, feedback } = req.body;
    
    let grade = "F";
    if (score >= 90) grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";
    else if (score >= 60) grade = "D";
    
    const result = new Result({ studentId: id, courseId, quizId, score, grade, feedback });
    await result.save();
    
    // Rank calculation would normally be updated here
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('modules');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'modules',
        populate: { path: 'contents quizId' }
      });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params; // quizId
    const { answers } = req.body; // array of { questionId, studentAnswer }
    
    const attempt = new Attempt({ studentId: req.user._id, quizId: id, status: "completed" });
    await attempt.save();
    
    let totalScore = 0;
    
    for (const ans of answers) {
      const question = await Question.findById(ans.questionId);
      const isCorrect = question.type === 'mcq' ? question.correctAnswer === ans.studentAnswer : null;
      let marksAwarded = 0;
      if (isCorrect) {
        marksAwarded = question.marks;
        totalScore += marksAwarded;
      }
      
      const submission = new Submission({
        attemptId: attempt._id,
        questionId: ans.questionId,
        studentAnswer: ans.studentAnswer,
        isCorrect,
        marksAwarded
      });
      await submission.save();
    }
    
    attempt.score = totalScore;
    await attempt.save();
    
    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getResults = async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user._id }).populate('courseId quizId');
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProgress = async (req, res) => {
  try {
    // Basic progress: count of completed modules vs total modules.
    // Assuming attempt records indicate completion.
    const courses = await Course.find();
    let progressData = [];
    
    for (const course of courses) {
      const totalModules = course.modules.length;
      const results = await Result.find({ studentId: req.user._id, courseId: course._id });
      const completedModules = results.length; // Simplified logic
      progressData.push({
        courseId: course._id,
        courseTitle: course.title,
        totalModules,
        completedModules,
        percentage: totalModules > 0 ? (completedModules / totalModules) * 100 : 0
      });
    }
    
    res.status(200).json(progressData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
`,

  'learning.route.js': `import express from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import {
  createCourse,
  createModule,
  createQuiz,
  gradeStudent,
  getCourses,
  getCourseById,
  submitQuiz,
  getResults,
  getProgress
} from "./learning.controller.js";

const router = express.Router();

// Tutor Routes
router.post("/courses", protect, authorize("tutor", "admin"), createCourse);
router.post("/courses/:id/modules", protect, authorize("tutor", "admin"), createModule);
router.post("/quiz/create", protect, authorize("tutor", "admin"), createQuiz);
router.post("/grade/student/:id", protect, authorize("tutor", "admin"), gradeStudent);

// Student Routes
router.get("/courses", protect, getCourses);
router.get("/courses/:id", protect, getCourseById);
router.post("/quiz/:id/submit", protect, authorize("student"), submitQuiz);
router.get("/results", protect, authorize("student"), getResults);
router.get("/progress", protect, authorize("student"), getProgress);

export default router;
`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(learningDir, filename), content);
}
console.log("Learning module created successfully.");

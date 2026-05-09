import { ApiError } from "../../middleware/error.middleware.js";
import mongoose from "mongoose";
import Attempt from "./attempt.model.js";
import Content from "./content.model.js";
import Course from "./course.model.js";
import CourseModule from "./courseModule.model.js";
import Enrollment from "./enrollment.model.js";
import Question from "./question.model.js";
import Quiz from "./quiz.model.js";
import Result from "./result.model.js";
import Submission from "./submission.model.js";

const hasInstructorAccess = (user) => ["tutor", "admin", "manager"].includes(user.role);

const gradeFromScore = (score) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

const assertCourseAccess = async (courseId, user) => {
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");
  if (user.role === "tutor" && String(course.tutorId) !== String(user._id)) {
    throw new ApiError(403, "You can only manage your own courses");
  }
  return course;
};

const recalculateCourseRanking = async (courseId) => {
  const ranking = await Result.aggregate([
    { $match: { courseId } },
    { $group: { _id: "$studentId", totalScore: { $sum: "$score" } } },
    { $sort: { totalScore: -1, _id: 1 } },
  ]);

  let previousScore = null;
  let rank = 0;
  for (let i = 0; i < ranking.length; i += 1) {
    const row = ranking[i];
    if (previousScore === null || row.totalScore < previousScore) {
      rank = i + 1;
    }
    previousScore = row.totalScore;
    await Result.updateMany({ courseId, studentId: row._id }, { $set: { rankPosition: rank } });
  }
};

export const LearningService = {
  async createCourse(payload, tutorId) {
    return Course.create({ ...payload, tutorId });
  },

  async createModule(courseId, payload, user) {
    const course = await assertCourseAccess(courseId, user);
    const courseModule = await CourseModule.create({
      courseId,
      title: payload.title,
      order: payload.order ?? course.modules.length,
    });

    const contents = [];
    if (payload.videoUrl) {
      contents.push({ moduleId: courseModule._id, type: "video", title: "Video lesson", url: payload.videoUrl });
    }
    if (payload.notes) {
      contents.push({ moduleId: courseModule._id, type: "notes", title: "Notes", text: payload.notes });
    }
    if (Array.isArray(payload.resources)) {
      payload.resources.forEach((url, idx) => contents.push({
        moduleId: courseModule._id,
        type: "resource",
        title: `Resource ${idx + 1}`,
        url,
      }));
    }
    if (Array.isArray(payload.contents) && payload.contents.length) {
      payload.contents.forEach((item) => contents.push({ ...item, moduleId: courseModule._id }));
    }
    if (contents.length) {
      const createdContents = await Content.insertMany(contents);
      courseModule.contents = createdContents.map((item) => item._id);
      await courseModule.save();
    }

    course.modules.push(courseModule._id);
    await course.save();
    return courseModule;
  },

  async createQuiz(payload, user) {
    await assertCourseAccess(payload.courseId, user);
    const quiz = await Quiz.create({
      title: payload.title,
      courseId: payload.courseId,
      moduleId: payload.moduleId,
    });

    const questions = await Question.insertMany(
      payload.questions.map((q) => ({
        quizId: quiz._id,
        text: q.question,
        type: q.type,
        options: q.type === "mcq" ? (q.options ?? []) : [],
        correctAnswer: q.correctAnswer,
        marks: q.marks ?? 1,
      })),
    );

    quiz.questions = questions.map((q) => q._id);
    await quiz.save();

    if (quiz.moduleId) {
      await CourseModule.findByIdAndUpdate(quiz.moduleId, { $set: { quizId: quiz._id } });
    }

    return quiz;
  },

  async addModuleContent({ courseId, moduleId, payload, user, file }) {
    await assertCourseAccess(courseId, user);
    const courseModule = await CourseModule.findOne({ _id: moduleId, courseId });
    if (!courseModule) throw new ApiError(404, "Module not found in this course");

    const inferredType = file
      ? (file.mimetype.startsWith("video/") ? "video" : "resource")
      : payload.type;
    if (!inferredType) {
      throw new ApiError(400, "Content type is required");
    }

    const storedPath = file
      ? `/${file.path.replace(/\\/g, "/")}`
      : payload.url;

    if (inferredType !== "notes" && !storedPath) {
      throw new ApiError(400, "Provide a file upload or URL for non-notes content");
    }
    if (inferredType === "notes" && !payload.text) {
      throw new ApiError(400, "Notes content requires text");
    }

    const content = await Content.create({
      moduleId: courseModule._id,
      type: inferredType,
      title: payload.title || file?.originalname || `${inferredType} content`,
      url: inferredType === "notes" ? undefined : storedPath,
      text: inferredType === "notes" ? payload.text : undefined,
    });

    courseModule.contents.push(content._id);
    await courseModule.save();
    return content;
  },

  async enrollInCourse(courseId, studentId) {
    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, "Course not found");
    await Enrollment.updateOne(
      { courseId, studentId },
      { $setOnInsert: { courseId, studentId } },
      { upsert: true },
    );
  },

  async submitQuiz(quizId, studentId, answers) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new ApiError(404, "Quiz not found");

    const isEnrolled = await Enrollment.exists({ courseId: quiz.courseId, studentId });
    if (!isEnrolled) throw new ApiError(403, "Enroll in this course before submitting");

    const questions = await Question.find({ quizId });
    const questionById = new Map(questions.map((q) => [String(q._id), q]));
    const attempt = await Attempt.create({ studentId, quizId, status: "completed", score: 0 });

    let totalScore = 0;
    const submissionRows = answers.map((ans) => {
      const question = questionById.get(ans.questionId);
      if (!question) throw new ApiError(400, "Answer references invalid question");
      const isCorrect = question.type === "mcq" ? question.correctAnswer === ans.studentAnswer : null;
      const marksAwarded = isCorrect ? question.marks : 0;
      totalScore += marksAwarded;
      return {
        attemptId: attempt._id,
        questionId: question._id,
        studentAnswer: ans.studentAnswer,
        isCorrect,
        marksAwarded,
      };
    });

    await Submission.insertMany(submissionRows);
    attempt.score = totalScore;
    await attempt.save();

    const result = await Result.findOneAndUpdate(
      { studentId, courseId: quiz.courseId, quizId: quiz._id },
      {
        $set: {
          score: totalScore,
          grade: gradeFromScore(totalScore),
        },
      },
      { upsert: true, new: true },
    );

    await recalculateCourseRanking(quiz.courseId);
    return { attempt, result };
  },

  async gradeStudent(studentId, payload, grader) {
    if (hasInstructorAccess(grader) === false) {
      throw new ApiError(403, "Forbidden");
    }
    await assertCourseAccess(payload.courseId, grader);

    const result = await Result.findOneAndUpdate(
      { studentId, courseId: payload.courseId, quizId: payload.quizId },
      {
        $set: {
          score: payload.score,
          grade: gradeFromScore(payload.score),
          feedback: payload.feedback ?? "",
        },
      },
      { upsert: true, new: true },
    );

    await recalculateCourseRanking(payload.courseId);
    return result;
  },

  async getStudentCourses(studentId) {
    const enrollments = await Enrollment.find({ studentId }).populate({
      path: "courseId",
      populate: {
        path: "modules",
        populate: [{ path: "contents" }, { path: "quizId", populate: { path: "questions", select: "-correctAnswer" } }],
      },
    });
    return enrollments.map((enrollment) => enrollment.courseId).filter(Boolean);
  },

  async getTutorCourses(tutorId) {
    return Course.find({ tutorId })
      .populate({
        path: "modules",
        populate: [{ path: "contents" }, { path: "quizId", populate: { path: "questions", select: "-correctAnswer" } }],
      })
      .sort({ createdAt: -1 });
  },

  async getCourseById(courseId, user) {
    const course = await Course.findById(courseId).populate({
      path: "modules",
      populate: [{ path: "contents" }, { path: "quizId", populate: { path: "questions", select: "-correctAnswer" } }],
    });
    if (!course) throw new ApiError(404, "Course not found");

    if (user.role === "student") {
      const enrollment = await Enrollment.exists({ courseId, studentId: user._id });
      if (!enrollment) throw new ApiError(403, "You are not enrolled in this course");
    } else if (user.role === "tutor" && String(course.tutorId) !== String(user._id)) {
      throw new ApiError(403, "You can only access your own courses");
    }
    return course;
  },

  async getResults(studentId) {
    const results = await Result.find({ studentId }).populate("courseId quizId").sort({ createdAt: -1 });
    const totalsMap = new Map();
    results.forEach((item) => {
      const courseId = String(item.courseId?._id ?? item.courseId);
      const current = totalsMap.get(courseId) ?? {
        courseId,
        courseTitle: item.courseId?.title ?? "Unknown Course",
        totalScore: 0,
        rank: item.rankPosition ?? null,
      };
      current.totalScore += item.score;
      if (current.rank === null || (item.rankPosition !== null && item.rankPosition < current.rank)) {
        current.rank = item.rankPosition;
      }
      totalsMap.set(courseId, current);
    });
    const totals = Array.from(totalsMap.values()).map((item) => ({
      ...item,
      grade: gradeFromScore(item.totalScore),
    }));
    return { results, totals };
  },

  async getCourseSubmissionsForTutor(courseId, user) {
    await assertCourseAccess(courseId, user);
    const quizzes = await Quiz.find({ courseId }).select("_id title");
    const quizIds = quizzes.map((q) => q._id);
    const attempts = await Attempt.find({ quizId: { $in: quizIds } })
      .populate("studentId", "name email")
      .populate("quizId", "title")
      .sort({ createdAt: -1 });

    return Promise.all(attempts.map(async (attempt) => {
      const submissions = await Submission.find({ attemptId: attempt._id }).populate("questionId", "text type marks");
      return {
        attempt,
        submissions,
      };
    }));
  },

  async getCourseRankingForTutor(courseId, user) {
    await assertCourseAccess(courseId, user);
    const rows = await Result.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
      { $group: { _id: "$studentId", totalScore: { $sum: "$score" }, bestRank: { $min: "$rankPosition" } } },
      { $sort: { totalScore: -1 } },
    ]);

    return rows.map((row, idx) => ({
      studentId: row._id,
      totalScore: row.totalScore,
      grade: gradeFromScore(row.totalScore),
      rankPosition: row.bestRank ?? idx + 1,
    }));
  },

  async gradeAttempt(attemptId, payload, user) {
    if (hasInstructorAccess(user) === false) throw new ApiError(403, "Forbidden");

    const attempt = await Attempt.findById(attemptId).populate("quizId");
    if (!attempt) throw new ApiError(404, "Attempt not found");

    const quiz = await Quiz.findById(attempt.quizId?._id ?? attempt.quizId);
    if (!quiz) throw new ApiError(404, "Quiz not found");

    await assertCourseAccess(quiz.courseId, user);

    const submissions = await Submission.find({ attemptId: attempt._id });
    const submissionById = new Map(submissions.map((s) => [String(s._id), s]));

    payload.submissions.forEach((update) => {
      const row = submissionById.get(update.submissionId);
      if (!row) throw new ApiError(400, "Submission does not belong to this attempt");
      row.marksAwarded = update.marksAwarded;
      if (typeof update.isCorrect === "boolean") row.isCorrect = update.isCorrect;
      if (typeof update.tutorFeedback === "string") row.tutorFeedback = update.tutorFeedback;
      row.reviewedAt = new Date();
    });

    await Promise.all(Array.from(submissionById.values()).map((s) => s.save()));

    const newScore = Array.from(submissionById.values()).reduce((sum, s) => sum + (s.marksAwarded || 0), 0);
    attempt.score = newScore;
    attempt.status = "completed";
    await attempt.save();

    const result = await Result.findOneAndUpdate(
      { studentId: attempt.studentId, courseId: quiz.courseId, quizId: quiz._id },
      {
        $set: {
          score: newScore,
          grade: gradeFromScore(newScore),
          feedback: payload.feedback ?? "",
        },
      },
      { upsert: true, new: true },
    );

    await recalculateCourseRanking(quiz.courseId);

    return { attempt, result };
  },

  async getProgress(studentId) {
    const enrollments = await Enrollment.find({ studentId }).populate("courseId");
    const data = [];

    for (const enrollment of enrollments) {
      const course = enrollment.courseId;
      if (!course) continue;
      const modules = await CourseModule.find({ courseId: course._id }).select("_id quizId");
      const totalModules = modules.length;
      const moduleQuizIds = modules.map((m) => String(m.quizId)).filter(Boolean);
      const completedQuizIds = await Result.distinct("quizId", { studentId, courseId: course._id });
      const completedModules = completedQuizIds.filter((id) => moduleQuizIds.includes(String(id))).length;
      data.push({
        courseId: course._id,
        courseTitle: course.title,
        totalModules,
        completedModules,
        percentage: totalModules ? Number(((completedModules / totalModules) * 100).toFixed(2)) : 0,
      });
    }
    return data;
  },
};


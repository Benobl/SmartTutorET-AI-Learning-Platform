import { LearningService } from "./learning.service.js";

export const createCourse = async (req, res, next) => {
  try {
    const course = await LearningService.createCourse(req.body, req.user._id);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const createModule = async (req, res, next) => {
  try {
    const moduleData = await LearningService.createModule(req.params.id, req.body, req.user);
    res.status(201).json({ success: true, data: moduleData });
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (req, res, next) => {
  try {
    const quiz = await LearningService.createQuiz(req.body, req.user);
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

export const addModuleContent = async (req, res, next) => {
  try {
    const content = await LearningService.addModuleContent({
      courseId: req.params.id,
      moduleId: req.params.moduleId,
      payload: req.body,
      user: req.user,
      file: req.file,
    });
    res.status(201).json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
};

export const enrollInCourse = async (req, res, next) => {
  try {
    await LearningService.enrollInCourse(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: "Enrolled successfully" });
  } catch (error) {
    next(error);
  }
};

export const gradeStudent = async (req, res, next) => {
  try {
    const result = await LearningService.gradeStudent(req.params.id, req.body, req.user);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getTutorCourses = async (req, res, next) => {
  try {
    const courses = await LearningService.getTutorCourses(req.user._id);
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getCourseSubmissionsForTutor = async (req, res, next) => {
  try {
    const submissions = await LearningService.getCourseSubmissionsForTutor(req.params.id, req.user);
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
};

export const getCourseRankingForTutor = async (req, res, next) => {
  try {
    const ranking = await LearningService.getCourseRankingForTutor(req.params.id, req.user);
    res.status(200).json({ success: true, data: ranking });
  } catch (error) {
    next(error);
  }
};

export const gradeAttempt = async (req, res, next) => {
  try {
    const graded = await LearningService.gradeAttempt(req.params.attemptId, req.body, req.user);
    res.status(200).json({ success: true, data: graded });
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const courses = await LearningService.getStudentCourses(req.user._id);
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await LearningService.getCourseById(req.params.id, req.user);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const result = await LearningService.submitQuiz(req.params.id, req.user._id, req.body.answers);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const resultData = await LearningService.getResults(req.user._id);
    res.status(200).json({ success: true, data: resultData });
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const progressData = await LearningService.getProgress(req.user._id);
    res.status(200).json({ success: true, data: progressData });
  } catch (error) {
    next(error);
  }
};

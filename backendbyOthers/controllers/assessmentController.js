const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const Progress = require('../models/Progress');

const createAssessment = async (req, res) => {
  try {
    const { course: courseId, lesson, title, description, type, questions, timeLimit, dueDate } = req.body;

    // Verify tutor is assigned to this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    if (course.assignedTutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this course' 
      });
    }

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

    const assessment = new Assessment({
      course: courseId,
      lesson,
      tutor: req.user._id,
      title,
      description,
      type,
      questions,
      totalPoints,
      timeLimit,
      dueDate
    });

    await assessment.save();
    await assessment.populate([
      { path: 'course', select: 'title' },
      { path: 'tutor', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssessments = async (req, res) => {
  try {
    const { course, type } = req.query;
    let query = {};

    if (type) query.type = type;

    // Students only see published assessments for their enrolled courses
    if (req.user.role === 'student') {
      query.isPublished = true;
      
      const enrolledCourses = await Course.find({ 
        enrolledStudents: req.user._id 
      }).select('_id');
      
      if (enrolledCourses.length === 0) {
        return res.json({ success: true, count: 0, data: [] });
      }
      
      // If course filter provided, check if student is enrolled
      if (course) {
        const isEnrolled = enrolledCourses.some(c => c._id.toString() === course);
        if (isEnrolled) {
          query.course = course;
        } else {
          return res.json({ success: true, count: 0, data: [] });
        }
      } else {
        query.course = { $in: enrolledCourses.map(c => c._id) };
      }
    } else {
      // Tutors see all their assessments
      if (course) query.course = course;
    }

    const assessments = await Assessment.find(query)
      .populate('course', 'title')
      .populate('tutor', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: assessments.length, data: assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('course', 'title')
      .populate('tutor', 'firstName lastName');

    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assessment not found' 
      });
    }

    // For students, don't show correct answers
    if (req.user.role === 'student') {
      const studentView = assessment.toObject();
      studentView.questions = studentView.questions.map(q => ({
        ...q,
        correctAnswer: undefined
      }));
      return res.json({ success: true, data: studentView });
    }

    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAssessment = async (req, res) => {
  try {
    const { questions } = req.body;
    
    // Recalculate total points if questions updated
    if (questions) {
      req.body.totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    }

    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('course tutor', 'title firstName lastName');

    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assessment not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Assessment updated successfully', 
      data: assessment 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);

    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assessment not found' 
      });
    }

    // Delete associated submissions
    await Submission.deleteMany({ assessment: assessment._id });

    res.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const publishAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true }
    );

    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assessment not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Assessment published successfully', 
      data: assessment 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body;
    
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assessment not found' 
      });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assessment: assessment._id,
      student: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted this assessment' 
      });
    }

    // Auto-grade the submission
    let score = 0;
    const gradedAnswers = answers.map((answer, index) => {
      const question = assessment.questions[index];
      const isCorrect = answer === question.correctAnswer;
      const pointsEarned = isCorrect ? (question.points || 1) : 0;
      score += pointsEarned;

      return {
        questionIndex: index,
        answer,
        isCorrect,
        pointsEarned
      };
    });

    const percentage = Math.round((score / assessment.totalPoints) * 100);
    const passed = percentage >= 60;

    const submission = new Submission({
      assessment: assessment._id,
      student: req.user._id,
      answers: gradedAnswers,
      score,
      totalPoints: assessment.totalPoints,
      percentage,
      passed,
      gradedAt: new Date()
    });

    await submission.save();

    // Update progress
    let progress = await Progress.findOne({
      student: req.user._id,
      course: assessment.course
    });

    if (progress && !progress.completedAssessments.includes(assessment._id)) {
      progress.completedAssessments.push(assessment._id);
      await progress.save();
    }

    res.json({
      success: true,
      message: 'Assessment submitted successfully',
      data: {
        submission,
        score,
        percentage,
        passed
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const { assessment, student } = req.query;
    let query = {};

    if (assessment) query.assessment = assessment;
    if (student) query.student = student;

    // Students see their own submissions
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    const submissions = await Submission.find(query)
      .populate('assessment', 'title type totalPoints')
      .populate('student', 'firstName lastName email')
      .sort({ submittedAt: -1 });

    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  publishAssessment,
  submitAssessment,
  getSubmissions
};

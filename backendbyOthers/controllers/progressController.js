const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Assessment = require('../models/Assessment');

const getProgress = async (req, res) => {
  try {
    const { course } = req.query;
    let query = { student: req.user._id };

    if (course) query.course = course;

    const progress = await Progress.find(query)
      .populate('course', 'title thumbnail')
      .populate('completedLessons', 'title week')
      .populate('completedAssessments', 'title type')
      .sort({ lastAccessedAt: -1 });

    res.json({ success: true, count: progress.length, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      student: req.user._id,
      course: req.params.courseId
    })
      .populate('course', 'title description')
      .populate('completedLessons', 'title week order')
      .populate('completedAssessments', 'title type');

    if (!progress) {
      return res.status(404).json({ 
        success: false, 
        message: 'Progress not found' 
      });
    }

    // Get total counts
    const totalLessons = await Lesson.countDocuments({ 
      course: req.params.courseId, 
      isPublished: true 
    });
    const totalAssessments = await Assessment.countDocuments({ 
      course: req.params.courseId, 
      isPublished: true 
    });

    res.json({ 
      success: true, 
      data: {
        ...progress.toObject(),
        totalLessons,
        totalAssessments,
        completedLessonsCount: progress.completedLessons.length,
        completedAssessmentsCount: progress.completedAssessments.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { timeSpent } = req.body;

    const progress = await Progress.findOneAndUpdate(
      { student: req.user._id, course: req.params.courseId },
      { 
        $inc: { timeSpent: timeSpent || 0 },
        lastAccessedAt: new Date()
      },
      { new: true, upsert: true }
    ).populate('course', 'title');

    res.json({ 
      success: true, 
      message: 'Progress updated', 
      data: progress 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentStats = async (req, res) => {
  try {
    const progress = await Progress.find({ student: req.user._id })
      .populate('course', 'title category');

    const stats = {
      totalCourses: progress.length,
      completedCourses: progress.filter(p => p.totalProgress === 100).length,
      inProgressCourses: progress.filter(p => p.totalProgress > 0 && p.totalProgress < 100).length,
      totalTimeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
      averageProgress: progress.length > 0 
        ? Math.round(progress.reduce((sum, p) => sum + p.totalProgress, 0) / progress.length)
        : 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTutorStats = async (req, res) => {
  try {
    const courses = await Course.find({ assignedTutor: req.user._id });
    const courseIds = courses.map(c => c._id);

    const totalStudents = courses.reduce((sum, c) => sum + c.enrolledStudents.length, 0);
    
    const progress = await Progress.find({ course: { $in: courseIds } });
    const averageProgress = progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.totalProgress, 0) / progress.length)
      : 0;

    const stats = {
      totalCourses: courses.length,
      totalStudents,
      averageProgress,
      activeStudents: progress.filter(p => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return p.lastAccessedAt >= weekAgo;
      }).length
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProgress,
  getCourseProgress,
  updateProgress,
  getStudentStats,
  getTutorStats
};

const Course = require('../models/Course');
const User = require('../models/User');

const createCourse = async (req, res) => {
  try {
    const { title, description, category, level, price, duration, syllabus } = req.body;

    const course = new Course({
      title,
      description,
      category,
      level,
      price,
      duration,
      syllabus,
      createdBy: req.user._id
    });

    await course.save();
    await course.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('assignedTutor', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTutor', 'firstName lastName email')
      .populate('enrolledStudents', 'firstName lastName email');

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy assignedTutor', 'firstName lastName');

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Course updated successfully', 
      data: course 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const postTutorVacancy = async (req, res) => {
  try {
    const { requirements, deadline } = req.body;
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        tutorVacancy: {
          isOpen: true,
          requirements,
          deadline
        }
      },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Tutor vacancy posted successfully', 
      data: course 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getManagerCourses = async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.user._id })
      .populate('assignedTutor', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTutorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ assignedTutor: req.user._id })
      .populate('createdBy', 'firstName lastName')
      .populate('enrolledStudents', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentCourses = async (req, res) => {
  try {
    const courses = await Course.find({ 
      enrolledStudents: req.user._id,
      isActive: true 
    })
      .populate('assignedTutor', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  postTutorVacancy,
  getManagerCourses,
  getTutorCourses,
  getStudentCourses
};

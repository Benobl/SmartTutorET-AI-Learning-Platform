const Timetable = require('../models/Timetable');
const Course = require('../models/Course');

// Manager creates a timetable entry for a course they manage
const createTimetable = async (req, res) => {
  try {
    const { course, title, dayOfWeek, startTime, endTime, location, meetingLink, recurrence, startDate, endDate } = req.body;

    // Verify the manager owns this course
    const courseDoc = await Course.findOne({ _id: course, createdBy: req.user._id });
    if (!courseDoc) {
      return res.status(403).json({ success: false, message: 'Course not found or you do not manage this course' });
    }

    const entry = new Timetable({
      course,
      title,
      dayOfWeek,
      startTime,
      endTime,
      location,
      meetingLink,
      recurrence,
      startDate,
      endDate,
      createdBy: req.user._id
    });

    await entry.save();
    await entry.populate('course', 'title');
    await entry.populate('createdBy', 'firstName lastName');

    res.status(201).json({ success: true, message: 'Timetable entry created', data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all timetable entries, optionally filtered by courseId
const getTimetable = async (req, res) => {
  try {
    const query = { isActive: true };
    if (req.query.courseId) {
      query.course = req.query.courseId;
    }

    const entries = await Timetable.find(query)
      .populate('course', 'title category')
      .populate('createdBy', 'firstName lastName')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get personal timetable for logged-in student or tutor
const getMyTimetable = async (req, res) => {
  try {
    let courseIds = [];

    if (req.user.role === 'student') {
      const courses = await Course.find({ enrolledStudents: req.user._id, isActive: true }).select('_id');
      courseIds = courses.map(c => c._id);
    } else if (req.user.role === 'tutor') {
      const courses = await Course.find({ assignedTutor: req.user._id, isActive: true }).select('_id');
      courseIds = courses.map(c => c._id);
    } else if (req.user.role === 'manager') {
      const courses = await Course.find({ createdBy: req.user._id, isActive: true }).select('_id');
      courseIds = courses.map(c => c._id);
    }

    const entries = await Timetable.find({ course: { $in: courseIds }, isActive: true })
      .populate('course', 'title category')
      .populate('createdBy', 'firstName lastName')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a timetable entry (manager only, must own the course)
const updateTimetable = async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id).populate('course');
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    // Verify the manager owns the course
    const courseDoc = await Course.findOne({ _id: entry.course._id, createdBy: req.user._id });
    if (!courseDoc) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this timetable entry' });
    }

    const allowedFields = ['title', 'dayOfWeek', 'startTime', 'endTime', 'location', 'meetingLink', 'recurrence', 'startDate', 'endDate', 'isActive'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        entry[field] = req.body[field];
      }
    });

    await entry.save();
    await entry.populate('course', 'title');
    await entry.populate('createdBy', 'firstName lastName');

    res.json({ success: true, message: 'Timetable entry updated', data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a timetable entry (manager only)
const deleteTimetable = async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    // Verify the manager owns the course
    const courseDoc = await Course.findOne({ _id: entry.course, createdBy: req.user._id });
    if (!courseDoc) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this timetable entry' });
    }

    await Timetable.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTimetable,
  getTimetable,
  getMyTimetable,
  updateTimetable,
  deleteTimetable
};

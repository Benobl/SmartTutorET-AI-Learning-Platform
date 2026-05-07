const WhiteboardSession = require('../models/WhiteboardSession');
const Course = require('../models/Course');

// Create a new whiteboard (tutor/manager)
const createWhiteboard = async (req, res) => {
  try {
    const { session, course, title, allowStudentDraw } = req.body;

    const whiteboard = new WhiteboardSession({
      session,
      course,
      title: title || 'Whiteboard',
      allowStudentDraw: allowStudentDraw || false,
      createdBy: req.user._id
    });

    await whiteboard.save();
    await whiteboard.populate('course', 'title');
    await whiteboard.populate('createdBy', 'firstName lastName');

    res.status(201).json({ success: true, message: 'Whiteboard created', data: whiteboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a whiteboard by ID
const getWhiteboard = async (req, res) => {
  try {
    const whiteboard = await WhiteboardSession.findById(req.params.id)
      .populate('course', 'title')
      .populate('createdBy', 'firstName lastName')
      .populate('session', 'title');

    if (!whiteboard) {
      return res.status(404).json({ success: false, message: 'Whiteboard not found' });
    }

    res.json({ success: true, data: whiteboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all whiteboards for a course
const getWhiteboardsByCourse = async (req, res) => {
  try {
    const whiteboards = await WhiteboardSession.find({
      course: req.params.courseId,
      isActive: true
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: whiteboards.length, data: whiteboards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save canvas data
const saveCanvas = async (req, res) => {
  try {
    const whiteboard = await WhiteboardSession.findById(req.params.id);
    if (!whiteboard) {
      return res.status(404).json({ success: false, message: 'Whiteboard not found' });
    }

    // Only the creator (tutor) or a manager can save canvas data
    const isCreator = whiteboard.createdBy.toString() === req.user._id.toString();
    const isManager = req.user.role === 'manager';

    if (!isCreator && !isManager) {
      // Students can only draw if allowStudentDraw is enabled
      if (req.user.role === 'student' && !whiteboard.allowStudentDraw) {
        return res.status(403).json({ success: false, message: 'Student drawing is not allowed on this whiteboard' });
      }
    }

    whiteboard.canvasData = req.body.canvasData || '';
    whiteboard.updatedAt = Date.now();
    await whiteboard.save();

    res.json({ success: true, message: 'Canvas saved', data: { updatedAt: whiteboard.updatedAt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle allowStudentDraw (tutor/manager only)
const toggleStudentDraw = async (req, res) => {
  try {
    const whiteboard = await WhiteboardSession.findById(req.params.id);
    if (!whiteboard) {
      return res.status(404).json({ success: false, message: 'Whiteboard not found' });
    }

    whiteboard.allowStudentDraw = !whiteboard.allowStudentDraw;
    whiteboard.updatedAt = Date.now();
    await whiteboard.save();

    res.json({
      success: true,
      message: whiteboard.allowStudentDraw ? 'Student drawing enabled' : 'Student drawing disabled',
      allowStudentDraw: whiteboard.allowStudentDraw
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a whiteboard (tutor/manager only)
const deleteWhiteboard = async (req, res) => {
  try {
    const whiteboard = await WhiteboardSession.findById(req.params.id);
    if (!whiteboard) {
      return res.status(404).json({ success: false, message: 'Whiteboard not found' });
    }

    // Only the creator or a manager can delete
    const isCreator = whiteboard.createdBy.toString() === req.user._id.toString();
    const isManager = req.user.role === 'manager';

    if (!isCreator && !isManager) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this whiteboard' });
    }

    await WhiteboardSession.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Whiteboard deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createWhiteboard,
  getWhiteboard,
  getWhiteboardsByCourse,
  saveCanvas,
  toggleStudentDraw,
  deleteWhiteboard
};

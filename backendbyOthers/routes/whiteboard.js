const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createWhiteboard,
  getWhiteboard,
  getWhiteboardsByCourse,
  saveCanvas,
  toggleStudentDraw,
  deleteWhiteboard
} = require('../controllers/whiteboardController');

// POST / — create a whiteboard (tutor/manager)
router.post('/', auth, authorize('tutor', 'manager'), createWhiteboard);

// GET /course/:courseId — list whiteboards for a course
router.get('/course/:courseId', auth, getWhiteboardsByCourse);

// GET /:id — get whiteboard by id
router.get('/:id', auth, getWhiteboard);

// PUT /:id/canvas — save canvas data
router.put('/:id/canvas', auth, saveCanvas);

// PUT /:id/toggle-draw — toggle allowStudentDraw (tutor/manager only)
router.put('/:id/toggle-draw', auth, authorize('tutor', 'manager'), toggleStudentDraw);

// DELETE /:id — delete whiteboard (tutor/manager only)
router.delete('/:id', auth, authorize('tutor', 'manager'), deleteWhiteboard);

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createTimetable,
  getTimetable,
  getMyTimetable,
  updateTimetable,
  deleteTimetable
} = require('../controllers/scheduleController');

// POST / — manager creates a timetable entry
router.post('/', auth, authorize('manager'), createTimetable);

// GET / — get all timetable entries (filter by courseId query param)
router.get('/', auth, getTimetable);

// GET /my — get personal timetable for logged-in user
router.get('/my', auth, getMyTimetable);

// PUT /:id — update entry (manager only)
router.put('/:id', auth, authorize('manager'), updateTimetable);

// DELETE /:id — delete entry (manager only)
router.delete('/:id', auth, authorize('manager'), deleteTimetable);

module.exports = router;

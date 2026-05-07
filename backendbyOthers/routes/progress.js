const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('student'), progressController.getProgress);
router.get('/stats/student', auth, authorize('student'), progressController.getStudentStats);
router.get('/stats/tutor', auth, authorize('tutor'), progressController.getTutorStats);
router.get('/:courseId', auth, progressController.getCourseProgress);
router.put('/:courseId', auth, progressController.updateProgress);

module.exports = router;

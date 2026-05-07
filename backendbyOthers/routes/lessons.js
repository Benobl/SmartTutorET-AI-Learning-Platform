const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { validate, lessonSchema } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('tutor'), validate(lessonSchema), lessonController.createLesson);
router.get('/', auth, lessonController.getLessons);
router.get('/:id', auth, lessonController.getLessonById);
router.put('/:id', auth, authorize('tutor'), lessonController.updateLesson);
router.delete('/:id', auth, authorize('tutor'), lessonController.deleteLesson);
router.put('/:id/publish', auth, authorize('tutor'), lessonController.publishLesson);
router.post('/:id/complete', auth, authorize('student'), lessonController.markLessonComplete);

module.exports = router;

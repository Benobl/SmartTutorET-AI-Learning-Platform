const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { validate, assessmentSchema } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('tutor'), validate(assessmentSchema), assessmentController.createAssessment);
router.get('/', auth, assessmentController.getAssessments);
router.get('/:id', auth, assessmentController.getAssessmentById);
router.put('/:id', auth, authorize('tutor'), assessmentController.updateAssessment);
router.delete('/:id', auth, authorize('tutor'), assessmentController.deleteAssessment);
router.put('/:id/publish', auth, authorize('tutor'), assessmentController.publishAssessment);
router.post('/:id/submit', auth, authorize('student'), assessmentController.submitAssessment);
router.get('/submissions', auth, assessmentController.getSubmissions);

module.exports = router;

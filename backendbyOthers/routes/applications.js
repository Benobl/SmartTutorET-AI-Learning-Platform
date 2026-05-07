const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { validate, applicationSchema } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('tutor'), validate(applicationSchema), applicationController.applyToCourse);
router.get('/', auth, applicationController.getApplications);
router.get('/:id', auth, applicationController.getApplicationById);
router.put('/:id', auth, authorize('manager'), applicationController.reviewApplication);

module.exports = router;

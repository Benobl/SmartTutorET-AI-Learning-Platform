const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { validate, sessionSchema } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('tutor'), validate(sessionSchema), sessionController.createSession);
router.get('/', auth, sessionController.getSessions);
router.get('/:id', auth, sessionController.getSessionById);
router.put('/:id', auth, authorize('tutor'), sessionController.updateSession);
router.delete('/:id', auth, authorize('tutor'), sessionController.deleteSession);
router.post('/:id/join', auth, sessionController.joinSession);
router.post('/:id/leave', auth, sessionController.leaveSession);

module.exports = router;

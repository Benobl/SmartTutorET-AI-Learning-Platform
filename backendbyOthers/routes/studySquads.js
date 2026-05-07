const express = require('express');
const router = express.Router();
const studySquadController = require('../controllers/studySquadController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Student routes
router.post('/', authorize('student'), studySquadController.createSquad);
router.get('/', studySquadController.getSquads);
router.get('/my-squads', authorize('student'), studySquadController.getMySquads);
router.get('/:id', studySquadController.getSquadById);
router.post('/:id/join', authorize('student'), studySquadController.joinSquad);
router.post('/:id/leave', authorize('student'), studySquadController.leaveSquad);
router.put('/:id', authorize('student'), studySquadController.updateSquad);
router.delete('/:id', authorize('student'), studySquadController.deleteSquad);

module.exports = router;

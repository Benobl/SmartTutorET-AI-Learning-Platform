const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { validate, groupSchema } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('tutor'), validate(groupSchema), groupController.createGroup);
router.get('/', auth, groupController.getGroups);
router.get('/:id', auth, groupController.getGroupById);
router.put('/:id', auth, authorize('tutor'), groupController.updateGroup);
router.delete('/:id', auth, authorize('tutor'), groupController.deleteGroup);
router.post('/:id/students', auth, authorize('tutor'), groupController.assignStudents);
router.delete('/:id/students/:studentId', auth, authorize('tutor'), groupController.removeStudent);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

// Leaderboard is accessible to all authenticated users (students, tutors, admin)
router.get('/leaderboard', auth, adminController.getLeaderboard);

// All routes below require admin role
router.use(auth, authorize('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/stats', adminController.getUserStats);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/verify', adminController.verifyUserAccount);
router.delete('/users/:id', adminController.deleteUser);

// Tutor applications (admin review)
router.get('/tutor-applications', adminController.getTutorApplications);
router.put('/tutor-applications/:id', adminController.reviewTutorApplication);

module.exports = router;

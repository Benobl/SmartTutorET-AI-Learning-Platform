const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { validate, courseSchema } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.get('/', auth, courseController.getCourses);
router.get('/:id', auth, courseController.getCourseById);

// Manager routes
router.post('/', auth, authorize('manager'), validate(courseSchema), courseController.createCourse);
router.put('/:id', auth, authorize('manager'), courseController.updateCourse);
router.delete('/:id', auth, authorize('manager'), courseController.deleteCourse);
router.post('/:id/vacancy', auth, authorize('manager'), courseController.postTutorVacancy);
router.get('/manager/my-courses', auth, authorize('manager'), courseController.getManagerCourses);

// Tutor routes
router.get('/tutor/my-courses', auth, authorize('tutor'), courseController.getTutorCourses);

// Student routes
router.get('/student/my-courses', auth, authorize('student'), courseController.getStudentCourses);

module.exports = router;

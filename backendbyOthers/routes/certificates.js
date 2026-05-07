const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getCertificate, verifyCertificate, getMyCertificates } = require('../controllers/certificateController');

// GET /my — get all certificates for logged-in student
router.get('/my', auth, authorize('student'), getMyCertificates);

// GET /verify/:certId — public certificate verification (no auth required)
router.get('/verify/:certId', verifyCertificate);

// GET /:courseId — generate/download certificate for a course
router.get('/:courseId', auth, authorize('student'), getCertificate);

module.exports = router;

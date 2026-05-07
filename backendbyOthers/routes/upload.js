const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const { auth } = require('../middleware/auth');

// Single file upload
router.post('/single', auth, upload.single('file'), uploadController.uploadFile);

// Multiple files upload
router.post('/multiple', auth, upload.array('files', 10), uploadController.uploadMultipleFiles);

module.exports = router;

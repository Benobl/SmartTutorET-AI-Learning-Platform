const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { auth } = require('../middleware/auth');

// Get all resources
router.get('/', auth, resourceController.getResources);

// Get resource by ID
router.get('/:id', auth, resourceController.getResourceById);

// Create resource (tutor only)
router.post('/', auth, resourceController.createResource);

// Update resource
router.put('/:id', auth, resourceController.updateResource);

// Delete resource
router.delete('/:id', auth, resourceController.deleteResource);

// Increment download count
router.post('/:id/download', auth, resourceController.incrementDownloadCount);

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { search } = require('../controllers/searchController');

// GET / — search across courses, tutors, and resources
router.get('/', auth, search);

module.exports = router;

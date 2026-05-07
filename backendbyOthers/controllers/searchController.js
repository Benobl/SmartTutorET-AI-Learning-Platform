const Course = require('../models/Course');
const User = require('../models/User');
const Resource = require('../models/Resource');

// Search across courses, tutors, and resources
const search = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const regex = new RegExp(q.trim(), 'i');
    const results = { courses: [], tutors: [], resources: [] };

    if (type === 'all' || type === 'courses') {
      results.courses = await Course.find({
        isActive: true,
        $or: [
          { title: regex },
          { description: regex },
          { category: regex }
        ]
      })
        .select('title description category level price thumbnail createdBy')
        .populate('createdBy', 'firstName lastName')
        .limit(5);
    }

    if (type === 'all' || type === 'tutors') {
      results.tutors = await User.find({
        role: 'tutor',
        isActive: true,
        $or: [
          { firstName: regex },
          { lastName: regex },
          { bio: regex }
        ]
      })
        .select('firstName lastName bio avatar qualifications')
        .limit(5);
    }

    if (type === 'all' || type === 'resources') {
      results.resources = await Resource.find({
        $or: [
          { title: regex },
          { description: regex }
        ]
      })
        .select('title description type url course')
        .populate('course', 'title')
        .limit(5);
    }

    const total = results.courses.length + results.tutors.length + results.resources.length;

    res.json({ success: true, query: q, total, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { search };

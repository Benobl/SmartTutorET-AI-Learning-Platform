const Resource = require('../models/Resource');
const Course = require('../models/Course');

const createResource = async (req, res) => {
  try {
    const { course, lesson, title, type, url, fileSize, description } = req.body;

    const resource = new Resource({
      course,
      lesson,
      uploadedBy: req.user._id,
      title,
      type,
      url,
      fileSize,
      description
    });

    await resource.save();
    await resource.populate([
      { path: 'course', select: 'title' },
      { path: 'lesson', select: 'title' },
      { path: 'uploadedBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getResources = async (req, res) => {
  try {
    const { course, lesson, type } = req.query;
    let query = {};

    if (course) query.course = course;
    if (lesson) query.lesson = lesson;
    if (type) query.type = type;

    // Students only see resources from their enrolled courses
    if (req.user.role === 'student') {
      const enrolledCourses = await Course.find({ 
        enrolledStudents: req.user._id 
      }).select('_id');
      
      if (enrolledCourses.length === 0) {
        return res.json({ success: true, count: 0, data: [] });
      }
      
      if (course) {
        const isEnrolled = enrolledCourses.some(c => c._id.toString() === course);
        if (!isEnrolled) {
          return res.json({ success: true, count: 0, data: [] });
        }
      } else {
        query.course = { $in: enrolledCourses.map(c => c._id) };
      }
    }

    const resources = await Resource.find(query)
      .populate('course', 'title')
      .populate('lesson', 'title')
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('course', 'title')
      .populate('lesson', 'title')
      .populate('uploadedBy', 'firstName lastName');

    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
      });
    }

    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('course lesson uploadedBy', 'title firstName lastName');

    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Resource updated successfully', 
      data: resource 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
      });
    }

    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const incrementDownloadCount = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Download count updated', 
      data: resource 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  incrementDownloadCount
};

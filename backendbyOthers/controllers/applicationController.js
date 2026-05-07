const TutorApplication = require('../models/TutorApplication');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { sendEmail, emailTemplates } = require('../utils/email');

const applyToCourse = async (req, res) => {
  try {
    const {
      course: courseId,
      coverLetter,
      experience,
      qualifications,
      teachingPhilosophy,
      availabilityHours,
      linkedinProfile,
      degreeAttachments
    } = req.body;

    // Check if course exists and has open vacancy
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    if (!course.tutorVacancy.isOpen) {
      return res.status(400).json({ 
        success: false, 
        message: 'No open vacancy for this course' 
      });
    }

    // Check if already applied
    const existingApplication = await TutorApplication.findOne({
      tutor: req.user._id,
      course: courseId
    });

    if (existingApplication) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied to this course' 
      });
    }

    const application = new TutorApplication({
      tutor: req.user._id,
      course: courseId,
      coverLetter,
      experience,
      qualifications,
      teachingPhilosophy,
      availabilityHours,
      linkedinProfile,
      degreeAttachments: degreeAttachments || []
    });

    await application.save();
    await application.populate([
      { path: 'tutor', select: 'firstName lastName email' },
      { path: 'course', select: 'title' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApplications = async (req, res) => {
  try {
    const { status, course } = req.query;
    let query = {};

    // If manager, show applications for their courses
    if (req.user.role === 'manager') {
      const managerCourses = await Course.find({ createdBy: req.user._id }).select('_id');
      query.course = { $in: managerCourses.map(c => c._id) };
    }

    // If tutor, show their own applications
    if (req.user.role === 'tutor') {
      query.tutor = req.user._id;
    }

    if (status) query.status = status;
    if (course) query.course = course;

    const applications = await TutorApplication.find(query)
      .populate('tutor', 'firstName lastName email')
      .populate('course', 'title category')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const application = await TutorApplication.findById(req.params.id)
      .populate('tutor', 'firstName lastName email phone qualifications')
      .populate('course', 'title description category')
      .populate('reviewedBy', 'firstName lastName');

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const reviewApplication = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const application = await TutorApplication.findById(req.params.id)
      .populate('tutor', 'firstName lastName email')
      .populate('course', 'title');

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Application already reviewed' 
      });
    }

    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewedAt = Date.now();
    if (rejectionReason) application.rejectionReason = rejectionReason;

    await application.save();

    // If approved, assign tutor to course
    if (status === 'approved') {
      await Course.findByIdAndUpdate(application.course._id, {
        assignedTutor: application.tutor._id,
        'tutorVacancy.isOpen': false
      });
    }

    // Create notification
    const notification = new Notification({
      recipient: application.tutor._id,
      type: status === 'approved' ? 'application-approved' : 'application-rejected',
      title: `Application ${status}`,
      message: status === 'approved' 
        ? `Your application for ${application.course.title} has been approved!`
        : `Your application for ${application.course.title} has been rejected.`,
      relatedId: application._id,
      relatedModel: 'TutorApplication'
    });
    await notification.save();

    // Send email
    const emailHtml = status === 'approved'
      ? emailTemplates.applicationApproved(
          application.tutor.firstName,
          application.course.title
        )
      : emailTemplates.applicationRejected(
          application.tutor.firstName,
          application.course.title,
          rejectionReason
        );

    await sendEmail(
      application.tutor.email,
      `Application ${status} - SmartTutorET`,
      emailHtml
    );

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      data: application
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyToCourse,
  getApplications,
  getApplicationById,
  reviewApplication
};

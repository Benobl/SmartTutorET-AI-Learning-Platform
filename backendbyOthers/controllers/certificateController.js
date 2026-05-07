const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');
const { generateCertificate } = require('../utils/certificate');

/**
 * GET /api/certificates/:courseId
 * Download or generate a certificate for the logged-in student
 */
const getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const progress = await Progress.findOne({
      student: req.user._id,
      course: courseId,
    }).populate('course', 'title');

    if (!progress) {
      return res.status(404).json({ success: false, message: 'No progress record found for this course' });
    }

    if (progress.totalProgress < 100) {
      return res.status(400).json({
        success: false,
        message: `Course not yet complete. Current progress: ${progress.totalProgress}%`,
      });
    }

    // If certificate already generated, serve it
    if (progress.certificateUrl && fs.existsSync(path.join(__dirname, '..', progress.certificateUrl))) {
      return res.json({
        success: true,
        data: {
          certificateUrl: `/${progress.certificateUrl}`,
          certId: progress.certId,
          issuedAt: progress.certificateIssuedAt,
        },
      });
    }

    // Generate new certificate
    const student = await User.findById(req.user._id).select('firstName lastName');
    const certId = uuidv4();

    const { filePath } = await generateCertificate({
      studentName: `${student.firstName} ${student.lastName}`,
      courseName: progress.course.title,
      completionDate: progress.updatedAt || new Date(),
      certId,
    });

    // Save to progress
    progress.certificateUrl = filePath;
    progress.certId = certId;
    progress.certificateIssuedAt = new Date();
    await progress.save();

    res.json({
      success: true,
      message: 'Certificate generated',
      data: {
        certificateUrl: `/${filePath}`,
        certId,
        issuedAt: progress.certificateIssuedAt,
      },
    });
  } catch (error) {
    console.error('Certificate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/certificates/verify/:certId
 * Public endpoint — verify a certificate by its ID
 */
const verifyCertificate = async (req, res) => {
  try {
    const { certId } = req.params;

    const progress = await Progress.findOne({ certId })
      .populate('student', 'firstName lastName')
      .populate('course', 'title');

    if (!progress) {
      return res.status(404).json({ success: false, message: 'Certificate not found or invalid' });
    }

    res.json({
      success: true,
      data: {
        studentName: `${progress.student.firstName} ${progress.student.lastName}`,
        courseName: progress.course.title,
        issuedAt: progress.certificateIssuedAt,
        certId,
        valid: true,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/certificates/my
 * Get all certificates earned by the logged-in student
 */
const getMyCertificates = async (req, res) => {
  try {
    const certs = await Progress.find({
      student: req.user._id,
      totalProgress: 100,
      certId: { $exists: true },
    }).populate('course', 'title category');

    res.json({ success: true, count: certs.length, data: certs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCertificate, verifyCertificate, getMyCertificates };

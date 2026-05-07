const User = require('../models/User');
const Course = require('../models/Course');
const TutorApplication = require('../models/TutorApplication');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const { sendEmail, emailTemplates } = require('../utils/email');

// ─── User Management ────────────────────────────────────────────────────────

const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, isVerified, search, page = 1, limit = 20 } = req.query;
    let query = {};

    // Exclude admin accounts from the user management list
    query.role = { $ne: 'admin' };

    if (role && role !== '') query.role = role;
    if (isActive !== undefined && isActive !== '') query.isActive = isActive === 'true';
    if (isVerified !== undefined && isVerified !== '') query.isVerified = isVerified === 'true';
    if (search && search !== '') {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -passwordResetToken -verificationToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -verificationToken');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Notify user — non-blocking
    try {
      await Notification.create({
        recipient: user._id,
        type: 'account-status',
        title: isActive ? 'Account Activated' : 'Account Deactivated',
        message: isActive
          ? 'Your account has been activated by the admin.'
          : 'Your account has been deactivated. Contact support for assistance.',
        relatedId: user._id,
        relatedModel: 'User'
      });
    } catch (notifErr) {
      console.error('Notification create failed (non-fatal):', notifErr.message);
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyUserAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Send verification email — non-blocking, don't fail if email fails
    try {
      const emailHtml = emailTemplates.accountVerified(user.firstName);
      await sendEmail(user.email, 'Account Verified - SmartTutorET', emailHtml);
    } catch (emailErr) {
      console.error('Verification email failed (non-fatal):', emailErr.message);
    }

    // Notify user
    try {
      await Notification.create({
        recipient: user._id,
        type: 'account-verified',
        title: 'Account Verified',
        message: 'Your account has been verified by the admin. You now have full access.',
        relatedId: user._id,
        relatedModel: 'User'
      });
    } catch (notifErr) {
      console.error('Notification create failed (non-fatal):', notifErr.message);
    }

    res.json({
      success: true,
      message: 'User account verified successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const [total, students, tutors, managers, active, verified] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'tutor' }),
      User.countDocuments({ role: 'manager' }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isVerified: true })
    ]);

    res.json({
      success: true,
      data: { total, students, tutors, managers, active, verified }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────

const getLeaderboard = async (req, res) => {
  try {
    const { type = 'points', limit = 10 } = req.query;

    if (type === 'points') {
      // Top students by points
      const leaders = await User.find({ role: 'student', isActive: true })
        .select('firstName lastName email avatar points badges')
        .sort({ points: -1 })
        .limit(Number(limit));

      return res.json({ success: true, type: 'points', data: leaders });
    }

    if (type === 'progress') {
      // Top students by average progress
      const progressData = await Progress.aggregate([
        {
          $group: {
            _id: '$student',
            avgProgress: { $avg: '$percentage' },
            totalCourses: { $sum: 1 },
            completedCourses: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        { $sort: { avgProgress: -1 } },
        { $limit: Number(limit) }
      ]);

      // Populate user info
      const userIds = progressData.map(p => p._id);
      const users = await User.find({ _id: { $in: userIds } })
        .select('firstName lastName email avatar');

      const userMap = {};
      users.forEach(u => { userMap[u._id.toString()] = u; });

      const leaders = progressData.map(p => ({
        ...userMap[p._id.toString()]?.toObject(),
        avgProgress: Math.round(p.avgProgress),
        totalCourses: p.totalCourses,
        completedCourses: p.completedCourses
      })).filter(l => l._id);

      return res.json({ success: true, type: 'progress', data: leaders });
    }

    if (type === 'courses') {
      // Top students by completed courses
      const progressData = await Progress.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: '$student',
            completedCourses: { $sum: 1 }
          }
        },
        { $sort: { completedCourses: -1 } },
        { $limit: Number(limit) }
      ]);

      const userIds = progressData.map(p => p._id);
      const users = await User.find({ _id: { $in: userIds } })
        .select('firstName lastName email avatar points');

      const userMap = {};
      users.forEach(u => { userMap[u._id.toString()] = u; });

      const leaders = progressData.map(p => ({
        ...userMap[p._id.toString()]?.toObject(),
        completedCourses: p.completedCourses
      })).filter(l => l._id);

      return res.json({ success: true, type: 'courses', data: leaders });
    }

    res.status(400).json({ success: false, message: 'Invalid leaderboard type' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Tutor Application Review (admin can also review) ────────────────────────

const getTutorApplications = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const applications = await TutorApplication.find(query)
      .populate('tutor', 'firstName lastName email phone qualifications isVerified')
      .populate('course', 'title category')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const reviewTutorApplication = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const application = await TutorApplication.findById(req.params.id)
      .populate('tutor', 'firstName lastName email')
      .populate('course', 'title');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewedAt = Date.now();
    if (rejectionReason) application.rejectionReason = rejectionReason;
    await application.save();

    // If approved, also verify the tutor account
    if (status === 'approved') {
      await User.findByIdAndUpdate(application.tutor._id, {
        isVerified: true,
        updatedAt: Date.now()
      });
    }

    // Notification
    try {
      await Notification.create({
        recipient: application.tutor._id,
        type: status === 'approved' ? 'application-approved' : 'application-rejected',
        title: `Tutor Application ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: status === 'approved'
          ? `Your tutor application for "${application.course.title}" has been approved! Your account is now verified.`
          : `Your tutor application for "${application.course.title}" was not approved.`,
        relatedId: application._id,
        relatedModel: 'TutorApplication'
      });
    } catch (notifErr) {
      console.error('Notification create failed (non-fatal):', notifErr.message);
    }

    // Email — non-blocking
    try {
      const emailHtml = status === 'approved'
        ? emailTemplates.tutorApplicationApproved(application.tutor.firstName, application.course.title)
        : emailTemplates.applicationRejected(application.tutor.firstName, application.course.title, rejectionReason);

      await sendEmail(
        application.tutor.email,
        `Tutor Application ${status === 'approved' ? 'Approved' : 'Update'} - SmartTutorET`,
        emailHtml
      );
    } catch (emailErr) {
      console.error('Application email failed (non-fatal):', emailErr.message);
    }

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
  getAllUsers,
  getUserById,
  updateUserStatus,
  verifyUserAccount,
  deleteUser,
  getUserStats,
  getLeaderboard,
  getTutorApplications,
  reviewTutorApplication
};

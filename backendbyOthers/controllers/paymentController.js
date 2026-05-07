const Transaction = require('../models/Transaction');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const Progress = require('../models/Progress');
const { sendEmail, emailTemplates } = require('../utils/email');
const { generateTransactionId } = require('../utils/helpers');

const createPayment = async (req, res) => {
  try {
    const { course: courseId, amount, paymentMethod } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already enrolled in this course' 
      });
    }

    // Check for existing pending payment
    const existingPayment = await Transaction.findOne({
      user: req.user._id,
      course: courseId,
      status: 'pending'
    });

    if (existingPayment) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have a pending payment for this course' 
      });
    }

    const transaction = new Transaction({
      user: req.user._id,
      course: courseId,
      amount,
      paymentMethod,
      transactionId: generateTransactionId()
    });

    await transaction.save();
    await transaction.populate([
      { path: 'user', select: 'firstName lastName email' },
      { path: 'course', select: 'title price' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully. Awaiting approval.',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    // Students see their own payments
    if (req.user.role === 'student') {
      query.user = req.user._id;
    }

    if (status) query.status = status;

    const payments = await Transaction.find(query)
      .populate('user', 'firstName lastName email')
      .populate('course', 'title price')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Transaction.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('course', 'title price description')
      .populate('reviewedBy', 'firstName lastName');

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const reviewPayment = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const payment = await Transaction.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('course', 'title');

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment already reviewed' 
      });
    }

    payment.status = status;
    payment.reviewedBy = req.user._id;
    payment.reviewedAt = Date.now();
    if (rejectionReason) payment.rejectionReason = rejectionReason;

    await payment.save();

    // If approved, enroll student in course
    if (status === 'approved') {
      await Course.findByIdAndUpdate(payment.course._id, {
        $addToSet: { enrolledStudents: payment.user._id }
      });

      // Create progress record
      const progress = new Progress({
        student: payment.user._id,
        course: payment.course._id
      });
      await progress.save();
    }

    // Create notification — non-blocking
    try {
      await Notification.create({
        recipient: payment.user._id,
        type: status === 'approved' ? 'payment-approved' : 'payment-rejected',
        title: `Payment ${status}`,
        message: status === 'approved' 
          ? `Your payment for ${payment.course.title} has been approved. You are now enrolled!`
          : `Your payment for ${payment.course.title} has been rejected.`,
        relatedId: payment._id,
        relatedModel: 'Transaction'
      });
    } catch (notifErr) {
      console.error('Notification create failed (non-fatal):', notifErr.message);
    }

    // Send email — non-blocking
    try {
      const emailHtml = status === 'approved'
        ? emailTemplates.paymentApproved(payment.user.firstName, payment.course.title, payment.amount)
        : emailTemplates.paymentRejected(payment.user.firstName, payment.course.title, rejectionReason);
      await sendEmail(payment.user.email, `Payment ${status} - SmartTutorET`, emailHtml);
    } catch (emailErr) {
      console.error('Payment email failed (non-fatal):', emailErr.message);
    }

    res.json({
      success: true,
      message: `Payment ${status} successfully`,
      data: payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentPayments = async (req, res) => {
  try {
    const payments = await Transaction.find({ user: req.user._id })
      .populate('course', 'title price thumbnail')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Chapa Integration ────────────────────────────────────────────────────────

const { initializePayment, verifyPayment } = require('../utils/chapa');

/**
 * POST /api/payments/chapa/initialize
 * Student initiates a Chapa checkout for a course
 */
const chapaInitialize = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // Check for existing pending/processing Chapa payment
    const existing = await Transaction.findOne({
      user: req.user._id,
      course: courseId,
      status: { $in: ['pending', 'processing'] },
      paymentMethod: 'chapa'
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending Chapa payment for this course',
        checkoutUrl: existing.chapaCheckoutUrl
      });
    }

    const txRef = generateTransactionId();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    const chapaRes = await initializePayment({
      amount: course.price,
      currency: 'ETB',
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      txRef,
      callbackUrl: `${backendUrl}/api/payments/chapa/webhook`,
      returnUrl: `${frontendUrl}/payment/callback?tx_ref=${txRef}`,
      title: 'SmartTutorET Course Payment',
      description: `Payment for ${course.title}`,
    });

    if (chapaRes.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Chapa initialization failed', details: chapaRes });
    }

    // Save transaction as processing
    const transaction = new Transaction({
      user: req.user._id,
      course: courseId,
      amount: course.price,
      currency: 'ETB',
      paymentMethod: 'chapa',
      status: 'processing',
      transactionId: txRef,
      chapaTxRef: txRef,
      chapaCheckoutUrl: chapaRes.data?.checkout_url,
    });
    await transaction.save();

    res.json({
      success: true,
      checkoutUrl: chapaRes.data?.checkout_url,
      txRef,
    });
  } catch (error) {
    console.error('Chapa initialize error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/payments/chapa/verify/:txRef
 * Called after redirect from Chapa — verifies and enrolls student
 */
const chapaVerify = async (req, res) => {
  try {
    const { txRef } = req.params;

    const transaction = await Transaction.findOne({ chapaTxRef: txRef })
      .populate('user', 'firstName lastName email')
      .populate('course', 'title price');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status === 'approved') {
      return res.json({ success: true, message: 'Already verified', data: transaction });
    }

    // Verify with Chapa
    const chapaRes = await verifyPayment(txRef);

    if (chapaRes.status === 'success' && chapaRes.data?.status === 'success') {
      transaction.status = 'approved';
      transaction.reviewedAt = Date.now();
      await transaction.save();

      // Enroll student
      await Course.findByIdAndUpdate(transaction.course._id, {
        $addToSet: { enrolledStudents: transaction.user._id }
      });

      // Create progress record
      const existingProgress = await Progress.findOne({
        student: transaction.user._id,
        course: transaction.course._id
      });
      if (!existingProgress) {
        await Progress.create({ student: transaction.user._id, course: transaction.course._id });
      }

      // Notification
      try {
        await Notification.create({
          recipient: transaction.user._id,
          type: 'payment-approved',
          title: 'Payment Approved',
          message: `Your Chapa payment for ${transaction.course.title} was successful. You are now enrolled!`,
          relatedId: transaction._id,
          relatedModel: 'Transaction'
        });
      } catch (e) { /* non-fatal */ }

      return res.json({ success: true, message: 'Payment verified and enrollment complete', data: transaction });
    } else {
      transaction.status = 'rejected';
      await transaction.save();
      return res.json({ success: false, message: 'Payment verification failed', data: transaction });
    }
  } catch (error) {
    console.error('Chapa verify error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/payments/chapa/webhook
 * Chapa webhook — auto-verify on payment completion
 */
const chapaWebhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    if (!tx_ref) {
      return res.status(400).json({ success: false, message: 'Missing tx_ref' });
    }

    const transaction = await Transaction.findOne({ chapaTxRef: tx_ref })
      .populate('user', 'firstName lastName email')
      .populate('course', 'title price');

    if (!transaction || transaction.status === 'approved') {
      return res.json({ success: true, message: 'Already processed or not found' });
    }

    if (status === 'success') {
      transaction.status = 'approved';
      transaction.reviewedAt = Date.now();
      await transaction.save();

      await Course.findByIdAndUpdate(transaction.course._id, {
        $addToSet: { enrolledStudents: transaction.user._id }
      });

      const existingProgress = await Progress.findOne({
        student: transaction.user._id,
        course: transaction.course._id
      });
      if (!existingProgress) {
        await Progress.create({ student: transaction.user._id, course: transaction.course._id });
      }

      try {
        await Notification.create({
          recipient: transaction.user._id,
          type: 'payment-approved',
          title: 'Payment Approved',
          message: `Your payment for ${transaction.course.title} was successful. You are now enrolled!`,
          relatedId: transaction._id,
          relatedModel: 'Transaction'
        });
      } catch (e) { /* non-fatal */ }
    } else {
      transaction.status = 'rejected';
      await transaction.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Chapa webhook error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  reviewPayment,
  getStudentPayments,
  chapaInitialize,
  chapaVerify,
  chapaWebhook,
};

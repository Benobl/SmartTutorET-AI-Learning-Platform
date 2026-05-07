const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SmartTutorET <noreply@smarttutor.com>',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  applicationApproved: (tutorName, courseName) => `
    <h2>Congratulations, ${tutorName}!</h2>
    <p>Your application to teach <strong>${courseName}</strong> has been approved.</p>
    <p>You can now start uploading lessons and scheduling sessions.</p>
    <p>Best regards,<br>SmartTutorET Team</p>
  `,
  
  applicationRejected: (tutorName, courseName, reason) => `
    <h2>Application Update</h2>
    <p>Dear ${tutorName},</p>
    <p>We regret to inform you that your application to teach <strong>${courseName}</strong> has been declined.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>Thank you for your interest. We encourage you to apply for other courses.</p>
    <p>Best regards,<br>SmartTutorET Team</p>
  `,
  
  paymentApproved: (studentName, courseName, amount) => `
    <h2>Payment Confirmed</h2>
    <p>Dear ${studentName},</p>
    <p>Your payment of <strong>$${amount}</strong> for <strong>${courseName}</strong> has been approved.</p>
    <p>You are now enrolled in the course. Start learning today!</p>
    <p>Best regards,<br>SmartTutorET Team</p>
  `,
  
  paymentRejected: (studentName, courseName, reason) => `
    <h2>Payment Update</h2>
    <p>Dear ${studentName},</p>
    <p>Your payment for <strong>${courseName}</strong> has been rejected.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>Please contact support if you have questions.</p>
    <p>Best regards,<br>SmartTutorET Team</p>
  `,
  
  sessionScheduled: (userName, sessionTitle, date, duration) => `
    <h2>New Session Scheduled</h2>
    <p>Dear ${userName},</p>
    <p>A new session has been scheduled:</p>
    <ul>
      <li><strong>Session:</strong> ${sessionTitle}</li>
      <li><strong>Date:</strong> ${new Date(date).toLocaleString()}</li>
      <li><strong>Duration:</strong> ${duration} minutes</li>
    </ul>
    <p>Best regards,<br>SmartTutorET Team</p>
  `,

  passwordReset: (userName, resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>Dear ${userName},</p>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in <strong>1 hour</strong>.</p>
      <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
      <p>Best regards,<br>SmartTutorET Team</p>
    </div>
  `,

  accountVerified: (userName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Account Verified ✓</h2>
      <p>Dear ${userName},</p>
      <p>Your SmartTutorET account has been <strong>verified</strong> by our admin team.</p>
      <p>You now have full access to all platform features. Log in to get started!</p>
      <p>Best regards,<br>SmartTutorET Team</p>
    </div>
  `,

  tutorApplicationApproved: (tutorName, courseName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">🎉 Tutor Application Approved!</h2>
      <p>Dear ${tutorName},</p>
      <p>Congratulations! Your application to teach <strong>${courseName}</strong> has been <strong>approved</strong>.</p>
      <p>Your account is now verified and you can:</p>
      <ul>
        <li>Upload lessons and course materials</li>
        <li>Schedule live sessions</li>
        <li>Create and manage student groups</li>
        <li>Create assessments and quizzes</li>
      </ul>
      <p>Log in to your dashboard to get started!</p>
      <p>Best regards,<br>SmartTutorET Team</p>
    </div>
  `
};

module.exports = {
  sendEmail,
  emailTemplates
};

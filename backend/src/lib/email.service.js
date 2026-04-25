import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

const isEmailConfigured = !!(process.env.EMAIL && process.env.EMAIL_PASS);

// Email verification
export const sendEmail = async (email, token) => {
  if (!isEmailConfigured) {
    console.warn("[Email] SMTP not configured. Skipping verification email.");
    return;
  }
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const link = `${frontendUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"SmartTutorET" <${process.env.EMAIL}>`,
    to: email,
    subject: "Verify Your SmartTutorET Account",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SmartTutorET!</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering with SmartTutorET. Please click the button below to verify your email address and activate your account:</p>
            <div style="text-align: center;">
              <a href="${link}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0ea5e9;">${link}</p>
            <p><strong>Note:</strong> This link will expire in 24 hours.</p>
            <p>If you didn't create an account with SmartTutorET, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 SmartTutorET. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

// Password reset email
export const sendPasswordResetEmail = async (email, token) => {
  if (!isEmailConfigured) {
    console.warn("[Email] SMTP not configured. Skipping password reset email.");
    return;
  }
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const link = `${frontendUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"SmartTutorET" <${process.env.EMAIL}>`,
    to: email,
    subject: "Reset Your SmartTutorET Password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your SmartTutorET account password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${link}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0ea5e9;">${link}</p>
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <ul>
                <li>This link will expire in 10 minutes</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password will remain unchanged</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2026 SmartTutorET. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

// Tutor approval email
export const sendTutorApprovalEmail = async (email, name) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const loginLink = `${frontendUrl}/login`;

  await transporter.sendMail({
    from: `"SmartTutorET" <${process.env.EMAIL}>`,
    to: email,
    subject: "🎉 Your Tutor Application Has Been Approved!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <h2>Welcome to the SmartTutorET Team, ${name}!</h2>
            <div class="success-box">
              <p><strong>✅ Your tutor application has been approved!</strong></p>
            </div>
            <p>We're excited to have you join our community of educators. You can now:</p>
            <ul>
              <li>Access your tutor dashboard</li>
              <li>Create and manage courses</li>
              <li>Connect with students</li>
              <li>Track your earnings</li>
              <li>View analytics and insights</li>
            </ul>
            <div style="text-align: center;">
              <a href="${loginLink}" class="button">Login to Dashboard</a>
            </div>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy teaching!</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 SmartTutorET. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

// Tutor rejection email
export const sendTutorRejectionEmail = async (email, name, reason = "") => {
  await transporter.sendMail({
    from: `"SmartTutorET" <${process.env.EMAIL}>`,
    to: email,
    subject: "Update on Your SmartTutorET Tutor Application",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Update</h1>
          </div>
          <div class="content">
            <h2>Dear ${name},</h2>
            <p>Thank you for your interest in becoming a tutor with SmartTutorET.</p>
            <div class="info-box">
              <p><strong>Application Status:</strong> Not Approved</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
            </div>
            <p>After careful review, we regret to inform you that we are unable to approve your tutor application at this time.</p>
            <p>This decision was based on our current requirements and the high volume of applications we receive.</p>
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>You may reapply after 30 days</li>
              <li>Consider gaining additional qualifications or experience</li>
              <li>Contact our support team if you have questions</li>
            </ul>
            <p>We appreciate your interest in SmartTutorET and wish you the best in your teaching career.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 SmartTutorET. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

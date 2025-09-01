const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const { logger } = require('./logger');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    logger.error('Error with email configuration:', error);
  } else {
    logger.info('Email server is ready to take our messages');
  }
});

/**
 * Send an email using a template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.template - EJS template name (without extension)
 * @param {Object} options.templateData - Data to pass to the template
 * @param {string} [options.from] - Sender email address
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendEmail = async ({
  to,
  subject,
  template,
  templateData = {},
  from = `"${process.env.EMAIL_FROM_NAME || 'Customer Management'}" <${process.env.EMAIL_FROM}>`,
}) => {
  try {
    // Render the email template
    const templatePath = path.join(__dirname, '../templates/emails', `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, {
      ...templateData,
      appName: process.env.APP_NAME || 'Customer Management',
      appUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      year: new Date().getFullYear(),
    });

    // Send the email
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    logger.error('Error sending email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendPasswordResetEmail = async (to, resetToken, userName) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to,
    subject: 'Password Reset Request',
    template: 'password-reset',
    templateData: {
      userName,
      resetUrl,
      expiresIn: '24 hours',
    },
  });
};

/**
 * Send a welcome email to a new user
 * @param {string} to - Recipient email address
 * @param {string} userName - User's name
 * @param {string} [tempPassword] - Temporary password (if applicable)
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendWelcomeEmail = async (to, userName, tempPassword = null) => {
  return sendEmail({
    to,
    subject: 'Welcome to Customer Management',
    template: 'welcome',
    templateData: {
      userName,
      tempPassword,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
    },
  });
};

/**
 * Send an email notification
 * @param {string} to - Recipient email address
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} [action] - Action button configuration
 * @param {string} [action.text] - Action button text
 * @param {string} [action.url] - Action button URL
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendNotificationEmail = async (to, title, message, action = null) => {
  return sendEmail({
    to,
    subject: title,
    template: 'notification',
    templateData: {
      title,
      message,
      action,
    },
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendNotificationEmail,
  transporter,
};

const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, // e.g. smtp.hostinger.com
  port: 465,                   // SSL
  secure: true,                // true for 465, false for 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP connection successful, ready to send emails");
  }
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const attachments = [];

    // Attach logo if exists
    const logoPath = path.join(__dirname, "../public/images/logo.jpg");
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: "logo.jpg",
        path: logoPath,
        cid: "companyLogo", // reference inside HTML
      });
    }

    const mailOptions = {
      from: `"CRM Admin" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text: text || "Please check your email client for HTML content.",
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📨 Email sent:", info.messageId, "to", to);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    // Optional retry logic could go here
  }
};

module.exports = sendEmail;

const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, // e.g. smtp.hostinger.com
  port: 465,                   // 587 (TLS) or 465 (SSL)
  secure: true,                // true for 465, false for 587
  auth: {
    user: process.env.MAIL_USER, // full email address
    pass: process.env.MAIL_PASS, // email password
  },
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

    await transporter.sendMail({
      from: {
        name: "CRM Admin",
        address: process.env.MAIL_USER,
      },
      to,
      subject,
      text,
      html,
      attachments,
    });

    console.log("📨 Email sent to", to);
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
  }
};

module.exports = sendEmail;

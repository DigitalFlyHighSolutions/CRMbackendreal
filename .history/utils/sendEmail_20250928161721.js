const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
  try {
    // Setup transporter with Hostinger SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465, // use 465 for SSL, 587 for TLS
      secure: true, // true for port 465
      auth: {
        user: process.env.EMAIL_USER, // e.g. rohit.vaishya@digitalflyhigh.in
        pass: process.env.EMAIL_PASS, // Hostinger email password
      },
    });

    const attachments = [];

    // Attach logo if it exists
    const logoPath = path.join(__dirname, "../public/images/logo.jpg");
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: "logo.jpg",
        path: logoPath,
        cid: "companyLogo", // use in HTML as <img src="cid:companyLogo"/>
      });
    }

    const mailOptions = {
      from: {
        name: "CRM Admin",
        address: process.env.EMAIL_FROM,
      },
      to,
      subject,
      text,
      html,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log("📨 Email sent to", to);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
};

module.exports = sendEmail;

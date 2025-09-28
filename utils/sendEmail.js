const path = require("path");
const fs = require("fs");
const sgMail = require("@sendgrid/mail");

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text, html) => {
  try {
    const attachments = [];

    // Attach logo if it exists
    const logoPath = path.join(__dirname, "../public/images/logo.jpg");
    if (fs.existsSync(logoPath)) {
      const logoContent = fs.readFileSync(logoPath).toString("base64");
      attachments.push({
        content: logoContent,
        filename: "logo.jpg",
        type: "image/jpeg",
        disposition: "inline",
        content_id: "companyLogo", // use in HTML: <img src="cid:companyLogo"/>
      });
    }

    const msg = {
      to,
      from: {
        email: process.env.EMAIL_FROM, // must be verified in SendGrid
        name: "CRM Admin",
      },
      subject,
      text,
      html,
      attachments,
    };

    await sgMail.send(msg);
    console.log("📨 Email sent to", to);
  } catch (err) {
    console.error("❌ Failed to send email:", err.response?.body || err);
  }
};

module.exports = sendEmail;

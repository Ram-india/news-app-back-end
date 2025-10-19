import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter once
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection once on startup
transporter.verify()
  .then(() => console.log(" Gmail SMTP ready"))
  .catch((err) => console.error(" Gmail SMTP error:", err.message));

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"News App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

// Wrapper for breaking news
export const sendBreakingNewsEmail = (to, headline, link) => {
  const html = `
    <div style="font-family:sans-serif;line-height:1.5">
      <h2 style="color:#b91c1c;">Breaking News</h2>
      <p style="font-size:16px;">${headline}</p>
      <p>
        <a href="${link}" target="_blank" style="color:#ef4444;font-weight:bold;text-decoration:none;">
          Read Full Article →
        </a>
      </p>
      <hr/>
      <small style="color:#6b7280;">You are receiving this email from News App.</small>
    </div>
  `;
  return sendEmail(to, "Breaking News Alert", html);
};
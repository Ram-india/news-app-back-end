import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // should be an App Password
      },
    });

    const mailOptions = {
      from: `"News App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error.message);
    throw error;
  }
};

// Specialized wrapper for breaking news alerts
export const sendBreakingNewsEmail = (to, headline, link) => {
  const html = `
    <h2 style="color:#b91c1c;">Breaking News</h2>
    <p>${headline}</p>
    <p>
      <a href="${link}" target="_blank" style="color:#ef4444;font-weight:bold;">
        Read Full Article →
      </a>
    </p>
  `;
  return sendEmail(to, "Breaking News Alert", html);
};
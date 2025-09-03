import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: {
        user: "apikey", // This is literally the string "apikey"
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    const mailOptions = {
      from: `"News App" <${process.env.EMAIL_USER}>`, // must match a verified sender in SendGrid
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent via SendGrid:", info.response);
    return info;
  } catch (error) {
    console.error(" Failed to send email:", error);
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
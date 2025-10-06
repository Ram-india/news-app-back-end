import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password (without spaces!)
      },
    });

    // Verify transporter before sending
    await transporter.verify();
    console.log("Gmail SMTP connection verified");

    const mailOptions = {
      from: `"News App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent via Gmail:", info.response);
    return info;
  } catch (error) {
    console.error(" Failed to send email:", error.message, error);
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
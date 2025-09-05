import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter before sending
    await transporter.verify();
    console.log(" Gmail SMTP connection verified");

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
    console.error("Failed to send email:", error.message, error);
    throw error;
  }
};
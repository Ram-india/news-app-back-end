import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"News App" <${process.env.EMAIL_USER}>`, // match the authenticated user
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(" Email sent:", info.response);
  } catch (error) {
    console.error(" Failed to send email:", error);
  }
};
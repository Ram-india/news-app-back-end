
import User from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";

dotenv.configconfig();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendRestLink = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate JWT reset token (1 hour expiry)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: "Password Reset Link",
      html: `<p>Hello ${user.name || "User"},</p>
             <p>Click <a href="${resetLink}" target="_blank">here</a> to reset your password</p>
             <p>If you did not request this, ignore this email.</p>`,
    };

    await sgMail.send(msg);
    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Error sending reset link:", error.response?.body || error.message);
    res.status(500).json({ message: "Failed to send reset link" });
  }
};
import User from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

dotenv.config();

export const sendRestLink = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`;

    await sendEmail(email, "Password Reset Link", html);

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Error sending reset link:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
import User from "../models/User.js";
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';


dotenv.config();

export const sendRestLink = async (req, res) => {
 const{email} = req.body;
 try{
    const user = await User.findOne({ email });
    if(!user){
        return res.status(404).json({ message: "User not found" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
        service: 'smtp.sendgrid.net',
        auth: {
            user: "apikey",
            pass: process.env.EMAIL_PASS,
        },
    });
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        port: 587,
        to: email,
        subject: 'Password Reset Link',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
    });
    res.json({ message: "Password reset link sent to your email" });
 }catch(error) {
    console.error("Error sending reset link:", error);
    return res.status(500).json({ message: "Internal server error" });
 }
}
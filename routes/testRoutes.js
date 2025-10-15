// routes/testRoutes.js
import express from "express";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

// Test Gmail SMTP
router.get("/test-email", async (req, res) => {
  try {
    await sendEmail(
      "nodemailler.demo@gmail.com", 
      "SMTP Test ✔️",
      "<p>This is a test email sent from Render Gmail SMTP</p>"
    );
    res.json({ success: true, message: " Test email sent successfully" });
  } catch (err) {
    console.error(" Test email error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
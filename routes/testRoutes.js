import express from "express";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail("bvn.ramkumar@gmail.com", "Test from News App", "<h1>✅ SendGrid Test Successful!</h1>");
    res.json({ message: "Test email sent successfully!" });
  } catch (error) {
    console.error("Test email failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
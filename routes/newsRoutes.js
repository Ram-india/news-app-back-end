import express from "express";
import {
  getTopHeadlines,
  personalizedNews,
  searchNews,
  sendBreakingNewsToUsers,
} from "../controllers/newsController.js";
import { sendBreakingNewsEmail } from "../utils/sendEmail.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// News routes
router.get("/top-headlines", getTopHeadlines);
router.get("/personalized", authMiddleware, personalizedNews);
router.get("/search", searchNews);

// Breaking news email to all users (admin-only, so protect with auth if needed)
router.post("/send-breaking-news", sendBreakingNewsToUsers);

// ✅ Test Gmail SMTP manually
router.get("/test-email", async (req, res) => {
  try {
    await sendBreakingNewsEmail(
      "nodemailler.demo@gmail.com", 
      "SMTP Test - Breaking News",
      "https://example.com/test-article"
    );
    res.json({ message: "✅ Test email sent successfully!" });
  } catch (error) {
    console.error("❌ SMTP test failed:", error);
    res.status(500).json({ message: "❌ Failed to send test email", error: error.message });
  }
});

export default router;
import express from "express";
import { sendCategoryNewsEmails } from "../controllers/emailController.js";

const router = express.Router();

// -------------------------
// Hourly and Daily
// -------------------------
router.get("/hourly", async (req, res) => {
  try {
    await sendCategoryNewsEmails("hourly");
    res.json({ message: "Hourly email job executed successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/daily", async (req, res) => {
  try {
    await sendCategoryNewsEmails("daily");
    res.json({ message: "Daily email job executed successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// Immediate / Breaking News
// -------------------------
router.post("/immediate", async (req, res) => {
  try {
    const { category, title, url, content } = req.body;

    if (!category || !title || !url) {
      return res.status(400).json({ message: "category, title, and url are required" });
    }

    const breakingNews = { category, title, url, content: content || "" };

    await sendCategoryNewsEmails("immediate", breakingNews);

    res.json({ message: "Immediate breaking news emails sent successfully!" });
  } catch (err) {
    console.error("Immediate email error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
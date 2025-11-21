import axios from "axios";
import User from "../models/User.js";
import { sendBreakingNewsEmail } from "../utils/sendEmail.js"; //

// ======================
// Get Top Headlines
// ======================
export const getTopHeadlines = async (req, res) => {
  try {
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        country: "us",
        apiKey: process.env.NEWS_API_KEY,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching top headlines:", error);
    res.status(500).json({ message: "Failed to fetch top headlines" });
  }
};

// ======================
// Personalized News
// ======================
export const personalizedNews = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const preferences = user.preferences || [];
    if (preferences.length === 0) {
      return res.status(200).json({ articles: [] });
    }

    if (!process.env.NEWS_API_KEY) {
      return res.status(500).json({ message: "NEWS_API_KEY is missing" });
    }

    // Fetch all categories in parallel
    const results = await Promise.all(
      preferences.map(async (category) => {
        try {
          const response = await axios.get("https://newsapi.org/v2/top-headlines", {
            params: { category, country: "us", apiKey: process.env.NEWS_API_KEY },
          });

          return response.data.articles.map((article) => ({
            ...article,
            category,
          }));
        } catch (err) {
          console.error(`Error fetching ${category}:`, err.response?.data || err.message);
          return [
            {
              title: `No live news available for ${category}`,
              description: "Showing default fallback news.",
              url: "#",
              urlToImage: "https://via.placeholder.com/400x200.png?text=No+News",
              source: { name: "Fallback" },
              publishedAt: new Date().toISOString(),
              category,
            },
          ];
        }
      })
    );

    const allArticles = results.flat();
    res.status(200).json({ articles: allArticles });
  } catch (error) {
    console.error("Critical error fetching personalized news:", error);
    return res.status(500).json({
      message: "Failed to fetch personalized news",
      error: error.message,
      details: error.response?.data || null,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// ======================
// Search News
// ======================
export const searchNews = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }
  try {
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: query,
        apiKey: process.env.NEWS_API_KEY,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error searching news:", error);
    res.status(500).json({ message: "Failed to search news" });
  }
};

// ======================
// Send Breaking News Emails (Immediate Alerts)
// ======================
export const sendBreakingNewsToUsers = async (req, res) => {
  try {
    const { headline, link, category, content } = req.body;

    if (!headline || !link) {
      return res.status(400).json({ message: "Headline and link are required." });
    }

    // 1️ Find users who enabled immediate alerts and match the category
    const users = await User.find({
      alertFrequency: "immediate",
      preferences: category ? { $in: [category] } : { $exists: true },
    });

    if (users.length === 0) {
      return res
        .status(200)
        .json({ message: "No users found with immediate alert preference." });
    }

    console.log(`Sending breaking news to ${users.length} users...`);

    // 2️ Send to all users in parallel using SendGrid wrapper
    const results = await Promise.allSettled(
      users.map((user) =>
        sendBreakingNewsEmail(user.email, headline, link, content)
      )
    );

    // 3️ Handle success/failure
    const failed = results
      .map((r, i) => (r.status === "rejected" ? users[i].email : null))
      .filter(Boolean);

    console.log(` Emails successfully sent: ${users.length - failed.length}`);
    if (failed.length) console.error(" Failed emails:", failed);

    // 4 Return API response
    res.status(200).json({
      message: `Breaking news sent to ${users.length - failed.length} users.`,
      failedEmails: failed,
    });
  } catch (error) {
    console.error(" Error sending breaking news:", error);
    res.status(500).json({
      message: "Failed to send breaking news.",
      error: error.message,
    });
  }
};
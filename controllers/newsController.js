import axios from "axios";
import User from "../models/User.js";
import { sendBreakingNewsEmail } from "../utils/sendEmail.js";

// ======================
// Get Top Headlines
// ======================
export const getTopHeadlines = async (req, res) => {
  try {
    console.log("Using API Key:", process.env.NEWS_API_KEY);
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
    console.log("Using API Key:", process.env.NEWS_API_KEY);
    console.log("Authenticated user:", req.user);

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
          console.log(`Fetching news for category: ${category}`);
          const response = await axios.get(
            "https://newsapi.org/v2/top-headlines",
            {
              params: { category, country: "us", apiKey: process.env.NEWS_API_KEY },
            }
          );

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
    console.log("Using API Key:", process.env.NEWS_API_KEY);
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
// Send Breaking News Emails
// ======================
export const sendBreakingNewsToUsers = async (req, res) => {
  try {
    console.log("Using API Key:", process.env.NEWS_API_KEY);
    const { headline, link } = req.body;

    if (!headline || !link) {
      return res.status(400).json({ message: "Headline and link are required." });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ message: "Email credentials are missing." });
    }

    // Step 1: Get all user emails
    const users = await User.find({}, "email");
    const emails = users.map((user) => user.email);

    if (emails.length === 0) {
      return res.status(200).json({ message: "No users to send emails to." });
    }

    // Step 2: Send emails in parallel
    const results = await Promise.allSettled(
      emails.map((email) => sendBreakingNewsEmail(email, headline, link))
    );

    const failed = results.filter((r) => r.status === "rejected");
    res.status(200).json({
      message: `Breaking news sent. ${failed.length} failed out of ${emails.length}.`,
      failedEmails: failed.map((f, idx) => emails[idx]), // optional: list failed addresses
    });
  } catch (error) {
    console.error("Error sending breaking news:", error);
    res.status(500).json({ message: "Failed to send breaking news." });
  }
};
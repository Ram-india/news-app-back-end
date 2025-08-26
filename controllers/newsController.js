import axios from "axios";
import User from "../models/User.js";
// import { sendBreakingNewsEmail } from "../utils/transporter.js";

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

export const personalizedNews = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const preferences = user.preferences || [];

    const allArticles = [];

    for (const category of preferences) {
      const response = await axios.get("https://newsapi.org/v2/top-headlines", {
        params: {
          category: category,
          country: "us",
          apiKey: process.env.NEWS_API_KEY,
        },
      });
      allArticles.push(...response.data.articles);
    }
    res.status(200).json({ articles: allArticles });
  } catch (error) {
    console.error("Error fetching personalized news:", error);
    res.status(500).json({ message: "Failed to fetch personalized news" });
  }
};

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

// Send breaking news email to all users
export const sendBreakingNewsToUsers = async (req, res) => {
    try {
      const { headline, link } = req.body;
  
      if (!headline || !link) {
        return res.status(400).json({ message: "Headline and link are required." });
      }
  
      // Step 1: Get all user emails
      const users = await User.find({}, "email"); // Only get emails
      const emails = users.map((user) => user.email);
  
      // Step 2: Send emails
      for (const email of emails) {
        await sendBreakingNewsEmail(email, headline, link);
      }
  
      res.status(200).json({ message: "Breaking news sent to all users." });
    } catch (error) {
      console.error("Error sending breaking news:", error);
      res.status(500).json({ message: "Failed to send breaking news." });
    }
  };

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
    console.log("Authenticated user:", req.user); // check user from JWT

    //  1. Get user from DB
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  2. Ensure preferences exist
    const preferences = user.preferences || [];
    if (preferences.length === 0) {
      return res.status(200).json({ articles: [] });
    }

    //  3. Ensure API key exists
    if (!process.env.NEWS_API_KEY) {
      return res.status(500).json({ message: "NEWS_API_KEY is missing" });
    }

    const allArticles = [];

    //  4. Fetch news for each category safely
    for (const category of preferences) {
      try {
        console.log(`Fetching news for category: ${category}`);
        const response = await axios.get("https://newsapi.org/v2/top-headlines", {
          params: {
            category,
            country: "us",
            apiKey: process.env.NEWS_API_KEY,
          },
        });

        // Attach category
        const articlesWithCategory = response.data.articles.map((article) => ({
          ...article,
          category,
        }));

        allArticles.push(...articlesWithCategory);
      } catch (err) {
        console.error(` Error fetching ${category}:`, err.response?.data || err.message);

        // Push a fallback article so frontend doesn’t break
        allArticles.push({
          title: `No live news available for ${category}`,
          description: "Showing default fallback news.",
          url: "#",
          urlToImage: "https://via.placeholder.com/400x200.png?text=No+News",
          source: { name: "Fallback" },
          publishedAt: new Date().toISOString(),
          category,
        });
      }
    }

    // 5. Send response back
    res.status(200).json({ articles: allArticles });
  } catch (error) {
    console.error(" Critical error fetching personalized news:", error);
  
    return res.status(500).json({
      message: "Failed to fetch personalized news",
      error: error.message,
      details: error.response?.data || null, // if it's a NewsAPI issue
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
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

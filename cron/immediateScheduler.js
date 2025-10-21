import cron from "node-cron";
import axios from "axios";
import { sendCategoryNewsEmails } from "../controllers/emailController.js";

let lastSentTitles = new Set(); // to avoid duplicate alerts

// Run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log(" Checking for new breaking news...");

  const categories = ["business", "entertainment", "health", "science", "sports", "technology"];

  for (const category of categories) {
    try {
      const response = await axios.get("https://newsapi.org/v2/top-headlines", {
        params: {
          category,
          country: "us",
          apiKey: process.env.NEWS_API_KEY,
        },
      });

      const article = response.data.articles[0]; // top headline

      // If article exists and is new
      if (article && !lastSentTitles.has(article.title)) {
        console.log(`🆕 Breaking news in ${category}: ${article.title}`);

        // send to users with "immediate" frequency
        await sendCategoryNewsEmails("immediate", {
          category,
          title: article.title,
          content: article.description || article.content || "",
          url: article.url,
        });

        // remember title so we don't send again
        lastSentTitles.add(article.title);
      }
    } catch (err) {
      console.error(` Error fetching ${category}:`, err.message);
    }
  }
});

console.log(" Immediate news scheduler active (runs every 5 min)");
import User from "../models/User.js";
import axios from "axios";
import { sendEmail } from "../utils/sendEmail.js";

// Send personalized category news emails
export const sendCategoryNewsEmails = async (frequency = "daily") => {
  try {
    const users = await User.find({
      alertfrequency: frequency,
      preferences: { $exists: true, $ne: [] },
    });

    console.log(` Found ${users.length} users with frequency: ${frequency}`);

    for (const user of users) {
      let emailContent = "";
      let hasNews = false;

      for (const category of user.preferences) {
        try {
          const response = await axios.get("https://newsapi.org/v2/top-headlines", {
            params: {
              category,
              country: "us",
              apiKey: process.env.NEWS_API_KEY,
            },
          });

          const articles = response.data.articles.slice(0, 3);
          console.log(`📡 ${articles.length} articles for ${category}`);

          if (articles.length > 0) {
            hasNews = true;
            emailContent += `<h3 style="color:#b91c1c;">${category.toUpperCase()}</h3>`;
            articles.forEach((article) => {
              emailContent += `
                <p>
                  <a href="${article.url}" target="_blank" style="color:#1d4ed8;text-decoration:none;">
                    ${article.title}
                  </a>
                </p>`;
            });

            // Ensure emailLogs exists
            if (!user.emailLogs) user.emailLogs = [];

            user.emailLogs.push({
              category,
              subject: `${category.toUpperCase()} News Update`,
              sentAt: new Date(),
            });
          }
        } catch (innerError) {
          console.error(` Error fetching news for ${category}:`, innerError);
        }
      }

      if (hasNews) {
        try {
          const html = `
            <div style="font-family:sans-serif;line-height:1.5">
              <h2 style="color:#b91c1c;">Hello ${user.name || "Reader"} </h2>
              <p>Here are your personalized news updates:</p>
              ${emailContent}
              <hr/>
              <small style="color:#6b7280;">
                You are receiving this email because you subscribed to personalized news updates.
              </small>
            </div>
          `;

          await sendEmail(user.email, "Your Personalized News Update", html);
          await user.save();

          console.log(`📧 Email sent to ${user.email}`);
        } catch (emailError) {
          console.error(` Failed to send email to ${user.email}:`, emailError);
        }
      }
    }

    console.log("All personalized emails processed successfully");
  } catch (error) {
    console.error(" Error in sendCategoryNewsEmails:", error);
  }
};

// Get email logs for authenticated user
export const getEmailLogs = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.emailLogs || []);
  } catch (error) {
    console.error("Error fetching email logs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete one email log entry
export const deleteEmailLog = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const logId = req.params.logId;
    user.emailLogs = user.emailLogs.filter((log) => log._id.toString() !== logId);
    await user.save();

    res.json({ message: "Log deleted" });
  } catch (error) {
    console.error(" Error deleting email log:", error);
    res.status(500).json({ message: "Server error" });
  }
};
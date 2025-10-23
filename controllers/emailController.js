import User from "../models/User.js";
import axios from "axios";
import { sendEmail } from "../utils/sendEmail.js";

// =============================
// Send Personalized News Emails
// =============================
export const sendCategoryNewsEmails = async (frequency = "daily", breakingNews = null) => {
  try {
    // Get users matching alert frequency
    const users = await User.find({
      alertFrequency: frequency,
      preferences: { $exists: true, $ne: [] },
    });

    console.log(`Found ${users.length} users with frequency: ${frequency}`);

    for (const user of users) {
      let emailContent = "";
      let hasNews = false;

      // IMMEDIATE MODE — skip API, use provided breaking news
      if (frequency === "immediate" && breakingNews) {
        if (user.preferences.includes(breakingNews.category)) {
          hasNews = true;
          emailContent += `
            <h3 style="color:#b91c1c;">BREAKING NEWS - ${breakingNews.category.toUpperCase()}</h3>
            <p>
            <a 
            href="${process.env.CLIENT_URL}/dashboard/news/${breakingNews.id || breakingNews._id || ''}" 
            target="_blank"
            style="color:#1d4ed8;text-decoration:none;"
          >
            ${breakingNews.title}
          </a>

            </p>
            <p>${breakingNews.content}</p>
          `;

          user.emailLogs.push({
            category: breakingNews.category,
            subject: `Breaking News: ${breakingNews.title}`,
            sentAt: new Date(),
          });
        }
      } 
      //  HOURLY / DAILY MODE — existing logic
      else {
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
            if (articles.length > 0) {
              hasNews = true;
              emailContent += `
                <h3 style="color:#b91c1c;">${category.toUpperCase()}</h3>
                ${articles
                  .map(
                    (article) => `
                    <p>
                      <a href="${article.url}" target="_blank" style="color:#1d4ed8;text-decoration:none;">
                        ${article.title}
                      </a>
                    </p>
                  `
                  )
                  .join("")}
              `;
              user.emailLogs.push({
                category,
                subject: `${category.toUpperCase()} News Update`,
                sentAt: new Date(),
              });
            }
          } catch (innerError) {
            console.error(` Error fetching news for '${category}':`, innerError.message);
          }
        }
      }

      // Send email
      if (hasNews) {
        try {
          const html = `
            <div style="font-family:sans-serif;line-height:1.5">
              <h2 style="color:#b91c1c;">Hello ${user.name || "Reader"},</h2>
              <p>Here are your ${frequency === "immediate" ? "breaking news" : "personalized news updates"}:</p>
              ${emailContent}
              <hr/>
              <small style="color:#6b7280;">
                You are receiving this email because you subscribed to ${frequency} news alerts.
              </small>
            </div>
          `;

          await sendEmail(user.email, `Your ${frequency} News Update`, html);
          await user.save();

          console.log(`Email sent to ${user.email}`);
        } catch (emailError) {
          console.error(` Failed to send email to ${user.email}:`, emailError.message);
        }
      } else {
        console.log(`No matching news for ${user.email}`);
      }
    }

    console.log(`All ${frequency} emails processed successfully`);
  } catch (error) {
    console.error(`Error in sendCategoryNewsEmails (${frequency}):`, error.message);
  }
};
// =============================
// Get Email Logs
// =============================
export const getEmailLogs = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.emailLogs || []);
  } catch (error) {
    console.error("Error fetching email logs:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// Delete Email Log
// =============================
export const deleteEmailLog = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const logId = req.params.logId;
    user.emailLogs = user.emailLogs.filter((log) => log._id.toString() !== logId);
    await user.save();

    res.json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error("Error deleting email log:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
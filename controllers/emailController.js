import User from "../models/User.js";
import axios from "axios";
import { sendEmail } from "../utils/sendEmail.js"; //  add this line

export const sendCategoryNewsEmails = async (frequency = 'daily') => {
    try {
      const users = await User.find({ 
        alertfrequency: frequency,
        preferences: { $exists: true, $ne: [] }
     });
  
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
            console.log(`Articles for ${category}:`, response.data.articles.length);
  
            const articles = response.data.articles.slice(0, 3);
  
            if (articles.length > 0) {
              hasNews = true;
              emailContent += `<h3>${category.toUpperCase()}</h3>`;
              articles.forEach(article => {
                emailContent += `<p><a href="${article.url}" target="_blank">${article.title}</a></p>`;
              });
  
              // Log email to user's emailLogs
              user.emailLogs.push({
                category,
                subject: `${category.toUpperCase()} News Update`,
                sentAt: new Date(),
              });
            }
          } catch (innerError) {
            console.error(`Error fetching news for category ${category}:`, innerError.message);
          }
        }
  
        if (hasNews) {
          try {
            await sendEmail(
              user.email,
              "Your Personalized News Update",
              `<h2>Hello ${user.name || "User"}</h2>${emailContent}`
            );
  
            await user.save();
            console.log(`📧 Email sent to ${user.email}`);
          } catch (emailError) {
            console.error(` Failed to send email to ${user.email}:`, emailError.message);
          }
        }
      }
  
      console.log(" All emails processed successfully");
    } catch (error) {
      console.error("Error in sendCategoryNewsEmails:", error.message);
    }
};

export const getEmailLogs = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      res.json(user.emailLogs);
    } catch (error) {
      console.error("Error fetching email logs:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export const deleteEmailLog = async (req, res) => {
    const user = await User.findById(req.user.userId);
    const logId = req.params.logId;
  
    user.emailLogs = user.emailLogs.filter((log) => log._id.toString() !== logId);
    await user.save();
  
    res.json({ message: "Log deleted" });
  };
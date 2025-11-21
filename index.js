import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import newsRoutes from "./routes/newsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bodyParser from "body-parser";
import preferenceRoutes from "./routes/preferenceRoutes.js";
import { sendCategoryNewsEmails } from './controllers/emailController.js';
import userRoutes from "./routes/userRoutes.js";
import "./cron/emailscheduler.js";
import "./cron/immediateScheduler.js";
import testRoutes from "./routes/testRoutes.js";

dotenv.config();

// Initialize Express app
const app = express();


// Debug incoming requests (optional)
app.use((req, res, next) => {
  console.log("Request Path:", req.path, "Origin:", req.headers.origin);
  next();
});

app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
connectDB();


// Test Route
app.get("/", (req, res) => {
  res.send("News -App Backend is running...");
});

// Route Mapping
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/test",testRoutes); 

console.log("Using API Key:", process.env.NEWS_API_KEY);
// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
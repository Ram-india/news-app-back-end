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
import  "./cron/emailscheduler.js";

dotenv.config();
// Initialize Express app
const app = express();


const allowedOrigins = [ process.env.CLIENT_URL ];

//Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow tools like Postman
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
// Handle preflight requests explicitly


app.get(/(.*)/, (req, res, next) => {
  console.log(req.path, req.params); // req.params will be { '0': '/the/path' }
  next();
});
app.use(bodyParser.json());

// Connect to MongoDB
app.use(express.json());
connectDB();
sendCategoryNewsEmails();

//Test Route
app.get('/', (req, res) => {
  res.send('News -App Backend is running...');
});

// Route Mapping
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use("/api/users", userRoutes );

//server start  

const PORT = process.env.PORT || 5000;
app.listen(PORT , () => {
  console.log(`Server is running on port ${PORT}`);
});


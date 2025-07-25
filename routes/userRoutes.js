import express from "express";
import { getEmailLogs,deleteEmailLog } from "../controllers/emailController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/email-logs", authMiddleware, getEmailLogs);
router.delete("/email-logs/:logId", authMiddleware, deleteEmailLog); 

export default router;
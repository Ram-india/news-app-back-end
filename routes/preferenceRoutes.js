import express from "express";
import { getPreferences, savePreferences } from "../controllers/preferenceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();



router.get('/', authMiddleware, getPreferences);     // GET /api/preferences
router.post('/', authMiddleware, savePreferences);   // POST /api/preferences 

export default router;
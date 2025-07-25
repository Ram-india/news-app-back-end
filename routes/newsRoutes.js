import express from 'express';
import {
  getTopHeadlines,
  personalizedNews,
  searchNews,
  // sendBreakingNewsToUsers
} from '../controllers/newsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/top-headlines', getTopHeadlines);
router.get('/personalized', authMiddleware, personalizedNews);
router.get('/search', searchNews);
// router.post('/send-breaking-news', sendBreakingNewsToUsers)

export default router;
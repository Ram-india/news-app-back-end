import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendRestLink } from '../controllers/sendRestLinkController.js';
import { resetPassword } from '../controllers/resetPasswordController.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get("/profile", authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/forgot-password', sendRestLink);
router.post('/reset-password/:token', resetPassword);


export default router;
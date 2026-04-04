import express from 'express';
import { sendMessage, getChatHistory, getSession } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.use(protect);
router.post('/message', sendMessage);
router.get('/history', getChatHistory);
router.get('/session/:sessionId', getSession);
export default router;

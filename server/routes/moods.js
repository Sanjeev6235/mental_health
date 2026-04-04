import express from 'express';
import { logMood, getMoods, deleteMood } from '../controllers/moodController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();
router.use(protect);
router.post('/', logMood);
router.get('/', getMoods);
router.delete('/:id', deleteMood);
export default router;

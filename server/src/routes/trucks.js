import express from 'express';
import { authenticateToken } from '../middleware/security.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  res.json({ success: true, message: 'Trucks endpoint - Coming soon', trucks: [] });
});

export default router;

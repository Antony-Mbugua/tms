import express from 'express';
import { authenticateToken } from '../middleware/security.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  res.json({ success: true, message: 'Brokers endpoint - Coming soon', data: [] });
});

export default router;

import express from 'express';
import { authenticateToken, requireRole } from '../middleware/security.js';

const router = express.Router();
router.use(authenticateToken);
router.use(requireRole(['admin']));

router.get('/system-health', async (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin system health endpoint - Coming soon',
    health: {
      status: 'healthy',
      database: 'connected',
      services: 'operational'
    }
  });
});

export default router;

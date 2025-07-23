import express from 'express';
import { authenticateToken } from '../middleware/security.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/stats', async (req, res) => {
  res.json({ 
    success: true, 
    message: 'Dashboard stats endpoint - Coming soon',
    stats: {
      activeLoads: 24,
      fleetSize: 15,
      activeDrivers: 12,
      monthlyRevenue: 85420
    }
  });
});

export default router;

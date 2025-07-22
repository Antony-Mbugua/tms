import express from 'express';
import { authenticateToken, requireRole } from '../middleware/security.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Get all users (admin only)
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Users endpoint - Coming soon',
      users: []
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;

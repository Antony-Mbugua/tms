import express from 'express';
import { query } from '../config/database.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', requireRole('admin'), async (req, res) => {
  try {
    const users = await query(`
      SELECT id, email, first_name, last_name, phone, role, is_active, 
             has_training_access, last_login, created_at
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;

import express from 'express';
import { query } from '../config/database.js';
import { requireTrainingAccess } from '../middleware/auth.js';

const router = express.Router();

router.get('/modules', requireTrainingAccess, async (req, res) => {
  try {
    const modules = await query(`
      SELECT tm.*, tc.name as category_name,
             utp.status as user_status, utp.completed_at, utp.score
      FROM training_modules tm
      JOIN training_categories tc ON tm.category_id = tc.id
      LEFT JOIN user_training_progress utp ON tm.id = utp.module_id AND utp.user_id = ?
      WHERE tm.is_active = TRUE
      ORDER BY tc.name, tm.title
    `, [req.user.id]);

    res.json({ success: true, data: modules });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch training modules' });
  }
});

export default router;

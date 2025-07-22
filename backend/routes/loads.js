import express from 'express';
import { query } from '../config/database.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get loads based on user role
router.get('/', async (req, res) => {
  try {
    let sql = `
      SELECT l.*, c.name as customer_name,
             u1.first_name as dispatcher_first_name, u1.last_name as dispatcher_last_name,
             u2.first_name as driver_first_name, u2.last_name as driver_last_name,
             t.truck_number
      FROM loads l
      LEFT JOIN customers c ON l.customer_id = c.id
      LEFT JOIN users u1 ON l.dispatcher_id = u1.id
      LEFT JOIN users u2 ON l.driver_id = u2.id
      LEFT JOIN trucks t ON l.truck_id = t.id
    `;

    const params = [];

    // Filter based on user role
    if (req.user.role === 'driver') {
      sql += ' WHERE l.driver_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'dispatcher') {
      sql += ' WHERE l.dispatcher_id = ? OR l.dispatcher_id IS NULL';
      params.push(req.user.id);
    }

    sql += ' ORDER BY l.created_at DESC';

    const loads = await query(sql, params);
    res.json({ success: true, data: loads });

  } catch (error) {
    console.error('Get loads error:', error);
    res.status(500).json({ error: 'Failed to fetch loads' });
  }
});

export default router;

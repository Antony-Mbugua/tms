import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const expenses = await query(`
      SELECT e.*, l.load_number, t.truck_number, u.first_name, u.last_name
      FROM expenses e
      LEFT JOIN loads l ON e.load_id = l.id
      LEFT JOIN trucks t ON e.truck_id = t.id
      LEFT JOIN users u ON e.driver_id = u.id
      ORDER BY e.expense_date DESC
    `);
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

export default router;

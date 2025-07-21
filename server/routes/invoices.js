import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const invoices = await query(`
      SELECT i.*, l.load_number, c.name as customer_name
      FROM invoices i
      LEFT JOIN loads l ON i.load_id = l.id
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
    `);
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

export default router;

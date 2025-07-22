import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const trucks = await query('SELECT * FROM trucks ORDER BY truck_number');
    res.json({ success: true, data: trucks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trucks' });
  }
});

export default router;

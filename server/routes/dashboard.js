import express from 'express';
import { query } from '../config/database.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let stats = {};

    if (userRole === 'admin') {
      // Admin dashboard stats
      const [
        userCount,
        truckCount,
        revenue,
        systemHealth
      ] = await Promise.all([
        query('SELECT COUNT(*) as total, SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active FROM users'),
        query('SELECT COUNT(*) as total, SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active FROM trucks'),
        query(`
          SELECT 
            SUM(CASE WHEN MONTH(paid_date) = MONTH(NOW()) AND YEAR(paid_date) = YEAR(NOW()) THEN total_amount ELSE 0 END) as current_month,
            SUM(CASE WHEN MONTH(paid_date) = MONTH(NOW() - INTERVAL 1 MONTH) AND YEAR(paid_date) = YEAR(NOW() - INTERVAL 1 MONTH) THEN total_amount ELSE 0 END) as previous_month
          FROM invoices WHERE status = 'paid'
        `),
        query('SELECT "99.8" as uptime') // Mock system health
      ]);

      stats = {
        users: {
          total: userCount[0].total,
          active: userCount[0].active
        },
        trucks: {
          total: truckCount[0].total,
          active: truckCount[0].active
        },
        revenue: {
          current: revenue[0].current_month || 0,
          previous: revenue[0].previous_month || 0,
          growth: revenue[0].previous_month > 0 
            ? ((revenue[0].current_month - revenue[0].previous_month) / revenue[0].previous_month * 100).toFixed(2)
            : 0
        },
        system: {
          uptime: systemHealth[0].uptime
        }
      };

    } else if (userRole === 'dispatcher') {
      // Dispatcher dashboard stats
      const [
        loadStats,
        truckStats,
        revenue
      ] = await Promise.all([
        query(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status IN ('assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery') THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
          FROM loads 
          WHERE dispatcher_id = ? OR dispatcher_id IS NULL
        `, [userId]),
        query('SELECT COUNT(*) as available FROM trucks WHERE status = "active"'),
        query(`
          SELECT SUM(l.total_amount) as today_revenue
          FROM loads l
          INNER JOIN invoices i ON l.id = i.load_id
          WHERE i.status = 'paid' AND DATE(i.paid_date) = CURDATE()
        `)
      ]);

      stats = {
        loads: {
          total: loadStats[0].total,
          active: loadStats[0].active,
          pending: loadStats[0].pending
        },
        trucks: {
          available: truckStats[0].available
        },
        revenue: {
          today: revenue[0].today_revenue || 0
        }
      };

    } else if (userRole === 'driver') {
      // Driver dashboard stats
      const [
        tripStats,
        earnings,
        performance
      ] = await Promise.all([
        query(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status IN ('assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery') THEN 1 ELSE 0 END) as active
          FROM loads 
          WHERE driver_id = ?
        `, [userId]),
        query(`
          SELECT 
            SUM(CASE WHEN WEEK(l.updated_at) = WEEK(NOW()) THEN l.total_amount ELSE 0 END) as week_earnings,
            SUM(CASE WHEN WEEK(l.updated_at) = WEEK(NOW()) THEN l.distance_miles ELSE 0 END) as week_miles
          FROM loads l
          INNER JOIN invoices i ON l.id = i.load_id
          WHERE l.driver_id = ? AND i.status = 'paid'
        `, [userId]),
        query(`
          SELECT AVG(pm.metric_value) as fuel_efficiency
          FROM performance_metrics pm
          INNER JOIN trucks t ON pm.entity_id = t.id
          INNER JOIN driver_assignments da ON t.id = da.truck_id
          WHERE pm.metric_name = 'fuel_efficiency' AND da.driver_id = ? AND da.is_active = TRUE
        `, [userId])
      ]);

      stats = {
        trips: {
          total: tripStats[0].total,
          active: tripStats[0].active
        },
        earnings: {
          week: earnings[0].week_earnings || 0
        },
        miles: {
          week: earnings[0].week_miles || 0
        },
        performance: {
          fuelEfficiency: performance[0].fuel_efficiency || 0
        }
      };

    } else if (userRole === 'accountant') {
      // Accountant dashboard stats
      const [
        invoiceStats,
        expenseStats,
        revenue
      ] = await Promise.all([
        query(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount,
            SUM(CASE WHEN status IN ('sent', 'viewed') THEN total_amount ELSE 0 END) as outstanding
          FROM invoices
          WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())
        `),
        query(`
          SELECT SUM(amount) as total_expenses
          FROM expenses
          WHERE MONTH(expense_date) = MONTH(NOW()) AND YEAR(expense_date) = YEAR(NOW())
        `),
        query(`
          SELECT 
            SUM(CASE WHEN MONTH(paid_date) = MONTH(NOW()) THEN total_amount ELSE 0 END) as current_month,
            SUM(CASE WHEN MONTH(paid_date) = MONTH(NOW() - INTERVAL 1 MONTH) THEN total_amount ELSE 0 END) as previous_month
          FROM invoices WHERE status = 'paid'
        `)
      ]);

      stats = {
        invoices: {
          total: invoiceStats[0].total,
          paidAmount: invoiceStats[0].paid_amount || 0,
          outstanding: invoiceStats[0].outstanding || 0
        },
        expenses: {
          total: expenseStats[0].total_expenses || 0
        },
        revenue: {
          current: revenue[0].current_month || 0,
          previous: revenue[0].previous_month || 0,
          growth: revenue[0].previous_month > 0 
            ? ((revenue[0].current_month - revenue[0].previous_month) / revenue[0].previous_month * 100).toFixed(2)
            : 0
        }
      };

    } else if (userRole === 'it_support') {
      // IT Support dashboard stats
      const [
        systemStats,
        securityStats,
        userStats
      ] = await Promise.all([
        query('SELECT "99.8" as uptime, "active" as status'), // Mock system health
        query(`
          SELECT 
            COUNT(*) as total_events,
            SUM(CASE WHEN risk_level IN ('high', 'critical') THEN 1 ELSE 0 END) as high_risk_events
          FROM security_events
          WHERE DATE(timestamp) >= DATE_SUB(CURDATE(), INTERVAL 24 HOUR)
        `),
        query(`
          SELECT 
            COUNT(*) as total_users,
            SUM(CASE WHEN is_online = TRUE THEN 1 ELSE 0 END) as online_users
          FROM users WHERE is_active = TRUE
        `)
      ]);

      stats = {
        system: {
          uptime: systemStats[0].uptime,
          status: systemStats[0].status
        },
        security: {
          totalEvents: securityStats[0].total_events,
          highRiskEvents: securityStats[0].high_risk_events
        },
        users: {
          total: userStats[0].total_users,
          online: userStats[0].online_users
        }
      };
    }

    res.json({ success: true, data: stats });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics' 
    });
  }
});

// Get recent activities/notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await query(`
      SELECT 
        id, title, message, type, category, is_read, created_at
      FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [req.user.id]);

    res.json({ success: true, data: notifications });

  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notifications' 
    });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    await query(`
      UPDATE notifications 
      SET is_read = TRUE, read_at = NOW() 
      WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);

    res.json({ success: true, message: 'Notification marked as read' });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ 
      error: 'Failed to mark notification as read' 
    });
  }
});

export default router;

import express from 'express';
import { authenticateToken, requireRole } from '../middleware/security.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Get all users (admin only)
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    // Mock user data - replace with actual database query
    const users = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@aoltms.com',
        role: 'driver',
        status: 'active',
        hasTrainingAccess: true,
        mfaEnabled: false,
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        createdAt: '2024-01-15T00:00:00Z'
      },
      {
        id: 2,
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@aoltms.com',
        role: 'dispatcher',
        status: 'active',
        hasTrainingAccess: true,
        mfaEnabled: true,
        lastLogin: new Date(Date.now() - 1800000).toISOString(),
        createdAt: '2024-01-10T00:00:00Z'
      },
      {
        id: 3,
        firstName: 'Mike',
        lastName: 'Davis',
        email: 'mike.davis@aoltms.com',
        role: 'accountant',
        status: 'active',
        hasTrainingAccess: false,
        mfaEnabled: true,
        lastLogin: new Date(Date.now() - 7200000).toISOString(),
        createdAt: '2024-01-05T00:00:00Z'
      },
      {
        id: 4,
        firstName: 'Carlos',
        lastName: 'Martinez',
        email: 'carlos.martinez@aoltms.com',
        role: 'driver',
        status: 'active',
        hasTrainingAccess: true,
        mfaEnabled: false,
        lastLogin: null,
        createdAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch users',
      code: 'USER_FETCH_ERROR'
    });
  }
});

// Get user by ID
router.get('/:id', requireRole(['admin', 'dispatcher']), async (req, res) => {
  try {
    const { id } = req.params;

    // Mock user data
    const user = {
      id: parseInt(id),
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@aoltms.com',
      role: 'driver',
      status: 'active',
      hasTrainingAccess: true,
      mfaEnabled: false,
      lastLogin: new Date(Date.now() - 3600000).toISOString(),
      createdAt: '2024-01-15T00:00:00Z'
    };

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', code: 'USER_FETCH_ERROR' });
  }
});

// Create new user (admin only)
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, hasTrainingAccess } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'VALIDATION_ERROR'
      });
    }

    // Check if email already exists (mock)
    const existingUser = null; // Replace with actual database check
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (mock)
    const newUser = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      role,
      status: 'active',
      hasTrainingAccess: hasTrainingAccess || false,
      mfaEnabled: false,
      lastLogin: null,
      createdAt: new Date().toISOString(),
      createdBy: req.user.id
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create user',
      code: 'USER_CREATE_ERROR'
    });
  }
});

// Update user (admin only)
router.put('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, status, hasTrainingAccess } = req.body;

    // Mock update
    const updatedUser = {
      id: parseInt(id),
      firstName,
      lastName,
      email,
      role,
      status,
      hasTrainingAccess,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id
    };

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update user',
      code: 'USER_UPDATE_ERROR'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Mock deletion
    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedId: parseInt(id)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete user',
      code: 'USER_DELETE_ERROR'
    });
  }
});

// Toggle user training access (admin only)
router.post('/:id/training-access', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { hasAccess } = req.body;

    // Mock training access toggle
    const result = {
      userId: parseInt(id),
      hasTrainingAccess: hasAccess,
      message: `Training access ${hasAccess ? 'granted' : 'revoked'}`,
      updatedAt: new Date().toISOString()
    };

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update training access', code: 'TRAINING_ACCESS_ERROR' });
  }
});

// Toggle user MFA (admin only)
router.post('/:id/mfa', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    // Mock MFA toggle
    const result = {
      userId: parseInt(id),
      mfaEnabled: enabled,
      message: `MFA ${enabled ? 'enabled' : 'disabled'} for user`,
      updatedAt: new Date().toISOString()
    };

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle MFA', code: 'MFA_TOGGLE_ERROR' });
  }
});

// Bulk import users (admin only)
router.post('/bulk-import', requireRole(['admin']), async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users)) {
      return res.status(400).json({
        error: 'Invalid data format',
        code: 'VALIDATION_ERROR'
      });
    }

    // Mock bulk import
    const results = {
      imported: users.length,
      failed: 0,
      duplicates: 0,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Bulk import completed',
      data: results
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to import users',
      code: 'BULK_IMPORT_ERROR'
    });
  }
});

// Get user roles
router.get('/roles/available', requireRole(['admin']), async (req, res) => {
  try {
    const roles = [
      { id: 'admin', name: 'Administrator', description: 'Full system access' },
      { id: 'dispatcher', name: 'Dispatcher', description: 'Load and driver management' },
      { id: 'driver', name: 'Driver', description: 'Mobile access and trip management' },
      { id: 'accountant', name: 'Accountant', description: 'Financial and billing management' },
      { id: 'it_support', name: 'IT Support', description: 'System monitoring and support' }
    ];

    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles', code: 'ROLES_FETCH_ERROR' });
  }
});

export default router;

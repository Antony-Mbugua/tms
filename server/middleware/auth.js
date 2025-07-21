import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const users = await query(
      'SELECT id, email, first_name, last_name, role, is_active, has_training_access FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'User not found or inactive',
        code: 'USER_INVALID'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(403).json({ 
      error: 'Invalid token',
      code: 'TOKEN_INVALID'
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: userRole
      });
    }

    next();
  };
};

export const requireTrainingAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.has_training_access && req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Training access required',
      code: 'TRAINING_ACCESS_REQUIRED'
    });
  }

  next();
};

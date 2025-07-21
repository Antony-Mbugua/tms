import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, mfaCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const users = await query(
      'SELECT id, email, password_hash, first_name, last_name, phone, role, is_active, is_online, has_training_access, mfa_enabled, mfa_secret FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      // Log failed login attempt
      await query(
        'INSERT INTO security_events (event_type, ip_address, user_agent, risk_level, details) VALUES (?, ?, ?, ?, ?)',
        ['login_failed', req.ip, req.get('User-Agent'), 'medium', JSON.stringify({ email, reason: 'user_not_found' })]
      );
      
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({ 
        error: 'Account is inactive' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      // Log failed login attempt
      await query(
        'INSERT INTO security_events (user_id, event_type, ip_address, user_agent, risk_level, details) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, 'login_failed', req.ip, req.get('User-Agent'), 'medium', JSON.stringify({ reason: 'invalid_password' })]
      );
      
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check MFA if enabled
    if (user.mfa_enabled && !mfaCode) {
      return res.status(200).json({ 
        requiresMFA: true,
        message: 'MFA code required' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Update last login and online status
    await query(
      'UPDATE users SET last_login = NOW(), is_online = TRUE WHERE id = ?',
      [user.id]
    );

    // Log successful login
    await query(
      'INSERT INTO security_events (user_id, event_type, ip_address, user_agent, risk_level) VALUES (?, ?, ?, ?, ?)',
      [user.id, 'login_success', req.ip, req.get('User-Agent'), 'low']
    );

    // Create session record
    await query(
      'INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
      [user.id, token.substring(0, 32), req.ip, req.get('User-Agent'), parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 480]
    );

    // Return user data (excluding sensitive information)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      isOnline: true,
      hasTrainingAccess: user.has_training_access,
      mfaEnabled: user.mfa_enabled
    };

    res.json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error during login' 
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.userId) {
        // Update user online status
        await query(
          'UPDATE users SET is_online = FALSE WHERE id = ?',
          [decoded.userId]
        );

        // Remove session
        await query(
          'DELETE FROM user_sessions WHERE session_token = ?',
          [token.substring(0, 32)]
        );

        // Log logout event
        await query(
          'INSERT INTO security_events (user_id, event_type, ip_address, user_agent, risk_level) VALUES (?, ?, ?, ?, ?)',
          [decoded.userId, 'logout', req.ip, req.get('User-Agent'), 'low']
        );
      }
    }

    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Internal server error during logout' 
    });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user data
    const users = await query(
      'SELECT id, email, first_name, last_name, phone, role, is_active, is_online, has_training_access, mfa_enabled FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'User not found or inactive' 
      });
    }

    const user = users[0];
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      isOnline: user.is_online,
      hasTrainingAccess: user.has_training_access,
      mfaEnabled: user.mfa_enabled
    };

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired' 
      });
    }
    
    res.status(401).json({ 
      error: 'Invalid token' 
    });
  }
});

export default router;

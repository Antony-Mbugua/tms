import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { validationResult } from 'express-validator';
import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';
import { query } from '../config/database.js';
import { logger } from '../utils/logger.js';

// JWT Token verification with zero trust principles
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists and is valid
    const sessions = await query(`
      SELECT s.*, u.id, u.email, u.role, u.is_active, u.locked_until
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = ? AND s.expires_at > NOW() AND s.revoked_at IS NULL
    `, [token]);

    if (sessions.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired session' 
      });
    }

    const session = sessions[0];

    // Check if user account is active
    if (!session.is_active) {
      return res.status(401).json({ 
        success: false, 
        error: 'Account is deactivated' 
      });
    }

    // Check if account is locked
    if (session.locked_until && new Date(session.locked_until) > new Date()) {
      return res.status(401).json({ 
        success: false, 
        error: 'Account is temporarily locked' 
      });
    }

    // Device fingerprint validation for zero trust
    const currentFingerprint = generateDeviceFingerprint(req);
    if (session.device_fingerprint && session.device_fingerprint !== currentFingerprint) {
      // Log suspicious activity
      await logSecurityEvent(session.user_id, 'suspicious_activity', req, 'high', {
        reason: 'device_fingerprint_mismatch',
        stored_fingerprint: session.device_fingerprint,
        current_fingerprint: currentFingerprint
      });

      return res.status(401).json({ 
        success: false, 
        error: 'Device verification failed' 
      });
    }

    // Update session activity
    await query(
      'UPDATE user_sessions SET last_activity = NOW() WHERE session_token = ?',
      [token]
    );

    // Attach user info to request
    req.user = {
      id: session.user_id,
      email: session.email,
      role: session.role,
      sessionId: session.id
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token has expired' 
      });
    }
    
    logger.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

// Role-based authorization
export const authorizeRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        // Log permission denied event
        await logSecurityEvent(req.user.id, 'permission_denied', req, 'medium', {
          required_roles: allowedRoles,
          user_role: req.user.role,
          requested_resource: req.path
        });

        return res.status(403).json({ 
          success: false, 
          error: 'Insufficient permissions' 
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Authorization check failed' 
      });
    }
  };
};

// Advanced rate limiting with different tiers
export const createRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      success: false,
      error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Login-specific rate limiting
export const loginRateLimit = createRateLimit({
  windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000,
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS) || 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Too many login attempts, please try again later'
  }
});

// Progressive delay for repeated requests
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 5000, // maximum delay of 5 seconds
});

// Input validation middleware
export const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Generate device fingerprint for zero trust
export const generateDeviceFingerprint = (req) => {
  const ua = UAParser(req.headers['user-agent']);
  const fingerprint = {
    browser: ua.browser.name,
    browserVersion: ua.browser.version,
    os: ua.os.name,
    osVersion: ua.os.version,
    device: ua.device.type || 'desktop',
    ip: req.ip,
    acceptLanguage: req.headers['accept-language'],
    acceptEncoding: req.headers['accept-encoding']
  };
  
  return Buffer.from(JSON.stringify(fingerprint)).toString('base64');
};

// Enhanced session validation
export const validateSession = async (req, res, next) => {
  try {
    if (!req.user || !req.user.sessionId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid session' 
      });
    }

    // Check session timeout
    const sessions = await query(`
      SELECT last_activity, expires_at 
      FROM user_sessions 
      WHERE id = ? AND revoked_at IS NULL
    `, [req.user.sessionId]);

    if (sessions.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }

    const session = sessions[0];
    const idleTimeout = parseInt(process.env.IDLE_TIMEOUT_MINUTES) || 30;
    const lastActivity = new Date(session.last_activity);
    const idleExpiry = new Date(lastActivity.getTime() + (idleTimeout * 60 * 1000));

    if (new Date() > idleExpiry) {
      // Revoke expired session
      await query(
        'UPDATE user_sessions SET revoked_at = NOW(), revoked_reason = ? WHERE id = ?',
        ['idle_timeout', req.user.sessionId]
      );

      return res.status(401).json({ 
        success: false, 
        error: 'Session expired due to inactivity' 
      });
    }

    next();
  } catch (error) {
    logger.error('Session validation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Session validation failed' 
    });
  }
};

// Log security events
export const logSecurityEvent = async (userId, eventType, req, riskLevel = 'low', details = {}) => {
  try {
    const geo = geoip.lookup(req.ip);
    
    await query(`
      INSERT INTO security_events (
        user_id, event_type, ip_address, user_agent, 
        location_country, location_city, risk_level, details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      eventType,
      req.ip,
      req.headers['user-agent'],
      geo?.country || null,
      geo?.city || null,
      riskLevel,
      JSON.stringify(details)
    ]);
  } catch (error) {
    logger.error('Failed to log security event:', error);
  }
};

// Check for suspicious patterns
export const detectAnomalies = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    // Check for multiple concurrent sessions
    const activeSessions = await query(`
      SELECT COUNT(*) as count 
      FROM user_sessions 
      WHERE user_id = ? AND expires_at > NOW() AND revoked_at IS NULL
    `, [req.user.id]);

    const maxSessions = parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 3;
    if (activeSessions[0].count > maxSessions) {
      await logSecurityEvent(req.user.id, 'suspicious_activity', req, 'medium', {
        reason: 'multiple_concurrent_sessions',
        session_count: activeSessions[0].count
      });
    }

    // Check for unusual IP patterns
    const recentIPs = await query(`
      SELECT DISTINCT ip_address 
      FROM security_events 
      WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `, [req.user.id]);

    if (recentIPs.length > 5) {
      await logSecurityEvent(req.user.id, 'suspicious_activity', req, 'high', {
        reason: 'multiple_ip_addresses',
        ip_count: recentIPs.length
      });
    }

    next();
  } catch (error) {
    logger.error('Anomaly detection error:', error);
    next(); // Continue on error to not block legitimate requests
  }
};

// Maintenance mode middleware
export const maintenanceMode = (req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.status(503).json({
      success: false,
      error: process.env.MAINTENANCE_MESSAGE || 'System maintenance in progress',
      retry_after: 3600 // 1 hour
    });
  }
  next();
};

export default {
  authenticateToken,
  authorizeRole,
  createRateLimit,
  loginRateLimit,
  speedLimiter,
  validateInput,
  generateDeviceFingerprint,
  validateSession,
  logSecurityEvent,
  detectAnomalies,
  maintenanceMode
};

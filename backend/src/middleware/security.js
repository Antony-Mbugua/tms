import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import speakeasy from 'speakeasy';
import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import ExpressBrute from 'express-brute';
import ExpressBruteRedis from 'express-brute-redis';
import NodeCache from 'node-cache';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import { db } from '../config/database.js';

// Initialize caches and stores
const sessionCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
const securityCache = new NodeCache({ stdTTL: 1800, checkperiod: 60 });

// Brute force protection store
let bruteStore;
try {
  // Use Redis if available, fallback to memory
  const RedisStore = ExpressBruteRedis;
  bruteStore = new RedisStore({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  });
} catch (error) {
  logger.warn('Redis not available, using memory store for brute force protection');
  bruteStore = new ExpressBrute.MemoryStore();
}

// =============================================
// RATE LIMITING & DDOS PROTECTION
// =============================================

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and internal requests
    return req.path === '/health' || req.ip === '127.0.0.1';
  }
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Progressive delay for repeated requests
export const progressiveDelay = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes at full speed
  delayMs: 500, // slow down subsequent requests by 500ms per request
  maxDelayMs: 20000, // maximum delay of 20 seconds
});

// Brute force protection for login attempts
export const bruteForceProtection = new ExpressBrute(bruteStore, {
  freeRetries: 5,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour
  lifetime: 24 * 60 * 60, // 1 day (seconds)
  failCallback: function (req, res, next, nextValidRequestDate) {
    logSecurityEvent(req, 'BRUTE_FORCE_DETECTED', 'critical', {
      nextValidRequestDate,
      failedAttempts: req.brute.totalHits
    });
    
    res.status(429).json({
      error: 'Too many failed attempts, account temporarily locked',
      code: 'ACCOUNT_TEMPORARILY_LOCKED',
      retryAfter: Math.round((nextValidRequestDate.getTime() - Date.now()) / 1000)
    });
  }
});

// =============================================
// CRYPTOGRAPHIC UTILITIES
// =============================================

// AES-256 encryption for sensitive data
export const encrypt = (text) => {
  if (!text) return null;
  
  try {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length < 32) {
      throw new Error('Invalid encryption key');
    }
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    logger.error('Encryption failed:', error);
    throw new Error('Encryption failed');
  }
};

// AES-256 decryption
export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  
  try {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length < 32) {
      throw new Error('Invalid encryption key');
    }
    
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption failed:', error);
    throw new Error('Decryption failed');
  }
};

// Generate secure random tokens
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash passwords with bcrypt
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password with bcrypt
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// =============================================
// JWT TOKEN MANAGEMENT
// =============================================

// Generate JWT access token
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    issuer: 'aol-tms',
    audience: 'aol-tms-users'
  });
};

// Generate JWT refresh token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'aol-tms',
    audience: 'aol-tms-users'
  });
};

// Verify JWT token
export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret, {
      issuer: 'aol-tms',
      audience: 'aol-tms-users'
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// =============================================
// DEVICE FINGERPRINTING
// =============================================

// Generate device fingerprint
export const generateDeviceFingerprint = (req) => {
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();
  
  const fingerprint = {
    userAgent: req.headers['user-agent'] || '',
    acceptLanguage: req.headers['accept-language'] || '',
    acceptEncoding: req.headers['accept-encoding'] || '',
    browser: result.browser.name || '',
    browserVersion: result.browser.version || '',
    os: result.os.name || '',
    osVersion: result.os.version || '',
    device: result.device.type || 'desktop',
    ip: getClientIP(req)
  };
  
  // Create SHA-256 hash of fingerprint data
  const fingerprintString = JSON.stringify(fingerprint);
  return crypto.createHash('sha256').update(fingerprintString).digest('hex');
};

// Get client IP address
export const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         '0.0.0.0';
};

// Get geolocation data from IP
export const getGeoLocation = (ip) => {
  try {
    const geo = geoip.lookup(ip);
    return geo ? {
      country: geo.country,
      region: geo.region,
      city: geo.city,
      timezone: geo.timezone,
      coordinates: [geo.ll[1], geo.ll[0]] // [longitude, latitude]
    } : null;
  } catch (error) {
    logger.warn('Geolocation lookup failed:', error);
    return null;
  }
};

// =============================================
// MULTI-FACTOR AUTHENTICATION
// =============================================

// Generate MFA secret
export const generateMFASecret = (userEmail) => {
  return speakeasy.generateSecret({
    name: `AOL TMS (${userEmail})`,
    issuer: 'AOL Transport Management System',
    length: 32
  });
};

// Verify MFA token
export const verifyMFAToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps (±30 seconds)
    step: 30
  });
};

// Generate backup codes for MFA
export const generateBackupCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

// =============================================
// AUTHENTICATION MIDDLEWARE
// =============================================

// Zero Trust Authentication Middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    // Check if session exists and is valid
    const session = await getValidSession(decoded.sessionId);
    if (!session) {
      return res.status(401).json({
        error: 'Session invalid or expired',
        code: 'SESSION_INVALID'
      });
    }

    // Get user with roles and permissions
    const user = await getUserWithPermissions(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'User not found or inactive',
        code: 'USER_INACTIVE'
      });
    }

    // Device fingerprint verification
    const currentFingerprint = generateDeviceFingerprint(req);
    if (session.device_fingerprint !== currentFingerprint) {
      await logSecurityEvent(req, 'DEVICE_FINGERPRINT_MISMATCH', 'high', {
        sessionFingerprint: session.device_fingerprint,
        currentFingerprint,
        userId: user.id
      });
      
      // Don't fail immediately, but flag as suspicious
      session.is_suspicious = true;
      session.risk_score = Math.min(session.risk_score + 0.3, 1.0);
    }

    // Update session activity
    await updateSessionActivity(session.id, req);

    // Attach user and session to request
    req.user = user;
    req.session = session;
    req.deviceFingerprint = currentFingerprint;

    // Log successful access
    await logSecurityEvent(req, 'DATA_ACCESS', 'low', {
      resource: req.originalUrl,
      method: req.method,
      userId: user.id
    });

    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    
    await logSecurityEvent(req, 'AUTHENTICATION_FAILED', 'medium', {
      error: error.message,
      token: req.headers['authorization']?.substring(0, 20) + '...'
    });

    res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = allowedRoles.some(role => 
      userRoles.some(userRole => userRole.name === role)
    );

    if (!hasRequiredRole) {
      logSecurityEvent(req, 'UNAUTHORIZED_ACCESS_ATTEMPT', 'medium', {
        requiredRoles: allowedRoles,
        userRoles: userRoles.map(r => r.name),
        resource: req.originalUrl
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles
      });
    }

    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = userPermissions.some(perm => perm.name === requiredPermission);

    if (!hasPermission) {
      logSecurityEvent(req, 'UNAUTHORIZED_ACCESS_ATTEMPT', 'medium', {
        requiredPermission,
        userPermissions: userPermissions.map(p => p.name),
        resource: req.originalUrl
      });

      return res.status(403).json({
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        required: requiredPermission
      });
    }

    next();
  };
};

// =============================================
// SESSION MANAGEMENT
// =============================================

// Create new session
export const createSession = async (userId, req) => {
  const sessionId = generateSecureToken(64);
  const deviceFingerprint = generateDeviceFingerprint(req);
  const ip = getClientIP(req);
  const geoLocation = getGeoLocation(ip);
  const parser = new UAParser(req.headers['user-agent']);

  const sessionData = {
    id: sessionId,
    user_id: userId,
    ip_address: ip,
    user_agent: req.headers['user-agent'] || '',
    device_fingerprint: deviceFingerprint,
    location_data: JSON.stringify(geoLocation),
    login_method: 'password',
    expires_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days
    is_active: true,
    is_suspicious: false,
    risk_score: 0.0
  };

  try {
    await db.execute(`
      INSERT INTO user_sessions (
        id, user_id, ip_address, user_agent, device_fingerprint,
        location_data, login_method, expires_at, is_active,
        is_suspicious, risk_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sessionData.id, sessionData.user_id, sessionData.ip_address,
      sessionData.user_agent, sessionData.device_fingerprint,
      sessionData.location_data, sessionData.login_method,
      sessionData.expires_at, sessionData.is_active,
      sessionData.is_suspicious, sessionData.risk_score
    ]);

    // Cache session for quick access
    sessionCache.set(sessionId, sessionData);

    return sessionData;
  } catch (error) {
    logger.error('Failed to create session:', error);
    throw new Error('Session creation failed');
  }
};

// Get valid session
export const getValidSession = async (sessionId) => {
  if (!sessionId) return null;

  // Check cache first
  let session = sessionCache.get(sessionId);
  
  if (!session) {
    // Query database
    try {
      const [rows] = await db.execute(`
        SELECT * FROM user_sessions 
        WHERE id = ? AND is_active = TRUE AND expires_at > NOW()
      `, [sessionId]);

      if (rows.length === 0) return null;
      
      session = rows[0];
      sessionCache.set(sessionId, session);
    } catch (error) {
      logger.error('Failed to get session:', error);
      return null;
    }
  }

  // Check if session is expired
  if (new Date(session.expires_at) < new Date()) {
    await invalidateSession(sessionId);
    return null;
  }

  return session;
};

// Update session activity
export const updateSessionActivity = async (sessionId, req) => {
  const ip = getClientIP(req);
  const now = new Date();

  try {
    await db.execute(`
      UPDATE user_sessions 
      SET last_activity = ?, ip_address = ?
      WHERE id = ?
    `, [now, ip, sessionId]);

    // Update cache
    const session = sessionCache.get(sessionId);
    if (session) {
      session.last_activity = now;
      session.ip_address = ip;
      sessionCache.set(sessionId, session);
    }
  } catch (error) {
    logger.error('Failed to update session activity:', error);
  }
};

// Invalidate session
export const invalidateSession = async (sessionId) => {
  try {
    await db.execute(`
      UPDATE user_sessions 
      SET is_active = FALSE 
      WHERE id = ?
    `, [sessionId]);

    sessionCache.del(sessionId);
  } catch (error) {
    logger.error('Failed to invalidate session:', error);
  }
};

// =============================================
// USER DATA RETRIEVAL
// =============================================

// Get user with roles and permissions
export const getUserWithPermissions = async (userId) => {
  try {
    const [userRows] = await db.execute(`
      SELECT u.*, 
             GROUP_CONCAT(DISTINCT r.name) as role_names,
             GROUP_CONCAT(DISTINCT p.name) as permission_names
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
      LEFT JOIN roles r ON ur.role_id = r.id AND r.is_active = TRUE
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ? AND u.is_active = TRUE
      GROUP BY u.id
    `, [userId]);

    if (userRows.length === 0) return null;

    const user = userRows[0];
    
    // Parse roles and permissions
    user.roles = user.role_names ? 
      user.role_names.split(',').map(name => ({ name: name.trim() })) : [];
    user.permissions = user.permission_names ? 
      user.permission_names.split(',').map(name => ({ name: name.trim() })) : [];

    // Remove raw strings
    delete user.role_names;
    delete user.permission_names;

    return user;
  } catch (error) {
    logger.error('Failed to get user with permissions:', error);
    return null;
  }
};

// =============================================
// SECURITY EVENT LOGGING
// =============================================

// Log security events for SIEM
export const logSecurityEvent = async (req, eventType, severity, details = {}) => {
  const ip = getClientIP(req);
  const geoLocation = getGeoLocation(ip);
  
  const eventData = {
    user_id: req.user?.id || null,
    session_id: req.session?.id || null,
    event_type: eventType,
    severity,
    description: generateEventDescription(eventType, details),
    details: JSON.stringify({
      ...details,
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'],
      timestamp: new Date().toISOString()
    }),
    ip_address: ip,
    user_agent: req.headers['user-agent'] || '',
    resource_accessed: req.originalUrl || '',
    risk_score: calculateRiskScore(eventType, severity, details)
  };

  try {
    await db.execute(`
      INSERT INTO security_events (
        user_id, session_id, event_type, severity, description,
        details, ip_address, user_agent, resource_accessed, risk_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      eventData.user_id, eventData.session_id, eventData.event_type,
      eventData.severity, eventData.description, eventData.details,
      eventData.ip_address, eventData.user_agent, eventData.resource_accessed,
      eventData.risk_score
    ]);

    // Log to application logger as well
    logger[severity](`Security Event: ${eventType}`, {
      ...eventData,
      geoLocation
    });

    // Trigger automated responses for critical events
    if (severity === 'critical') {
      await handleCriticalSecurityEvent(eventType, eventData);
    }

  } catch (error) {
    logger.error('Failed to log security event:', error);
  }
};

// Generate human-readable event descriptions
const generateEventDescription = (eventType, details) => {
  const descriptions = {
    'LOGIN': 'User successfully logged in',
    'LOGOUT': 'User logged out',
    'FAILED_LOGIN': 'Failed login attempt',
    'PASSWORD_CHANGE': 'User changed password',
    'MFA_ENABLED': 'Multi-factor authentication enabled',
    'MFA_DISABLED': 'Multi-factor authentication disabled',
    'ACCOUNT_LOCKED': 'Account locked due to security violation',
    'PERMISSION_CHANGED': 'User permissions modified',
    'DATA_ACCESS': 'User accessed protected resource',
    'DATA_MODIFICATION': 'User modified data',
    'SECURITY_VIOLATION': 'Security policy violation detected',
    'BRUTE_FORCE_DETECTED': 'Brute force attack detected',
    'DEVICE_FINGERPRINT_MISMATCH': 'Device fingerprint mismatch detected',
    'UNAUTHORIZED_ACCESS_ATTEMPT': 'Unauthorized access attempt',
    'AUTHENTICATION_FAILED': 'Authentication process failed'
  };

  let description = descriptions[eventType] || `Security event: ${eventType}`;
  
  if (details.userId) {
    description += ` (User ID: ${details.userId})`;
  }
  
  return description;
};

// Calculate risk score for events
const calculateRiskScore = (eventType, severity, details) => {
  const baseScores = {
    'low': 0.1,
    'medium': 0.3,
    'high': 0.6,
    'critical': 0.9
  };

  const eventMultipliers = {
    'FAILED_LOGIN': 1.2,
    'BRUTE_FORCE_DETECTED': 2.0,
    'DEVICE_FINGERPRINT_MISMATCH': 1.5,
    'UNAUTHORIZED_ACCESS_ATTEMPT': 1.8,
    'SECURITY_VIOLATION': 1.6
  };

  let score = baseScores[severity] || 0.1;
  score *= (eventMultipliers[eventType] || 1.0);

  return Math.min(score, 1.0);
};

// Handle critical security events
const handleCriticalSecurityEvent = async (eventType, eventData) => {
  try {
    // Implement automated responses based on event type
    switch (eventType) {
      case 'BRUTE_FORCE_DETECTED':
        // Could temporarily block IP or lock account
        logger.critical('Brute force attack detected', eventData);
        break;
        
      case 'SECURITY_VIOLATION':
        // Could invalidate all user sessions
        if (eventData.user_id) {
          await invalidateAllUserSessions(eventData.user_id);
        }
        break;
        
      default:
        logger.critical('Critical security event', { eventType, eventData });
    }
  } catch (error) {
    logger.error('Failed to handle critical security event:', error);
  }
};

// Invalidate all sessions for a user
const invalidateAllUserSessions = async (userId) => {
  try {
    await db.execute(`
      UPDATE user_sessions 
      SET is_active = FALSE 
      WHERE user_id = ? AND is_active = TRUE
    `, [userId]);

    logger.warn(`All sessions invalidated for user ${userId}`);
  } catch (error) {
    logger.error('Failed to invalidate user sessions:', error);
  }
};

// =============================================
// VALIDATION MIDDLEWARE
// =============================================

// Validate request data
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logSecurityEvent(req, 'SECURITY_VIOLATION', 'medium', {
      validationErrors: errors.array(),
      requestBody: req.body
    });

    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }
  
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Basic XSS protection - remove script tags and event handlers
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
        .replace(/on\w+\s*=\s*'[^']*'/gi, '');
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        } else {
          obj[key] = sanitizeValue(obj[key]);
        }
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

export default {
  generalRateLimit,
  authRateLimit,
  progressiveDelay,
  bruteForceProtection,
  authenticateToken,
  requireRole,
  requirePermission,
  validateRequest,
  sanitizeInput,
  encrypt,
  decrypt,
  generateSecureToken,
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateDeviceFingerprint,
  getClientIP,
  getGeoLocation,
  generateMFASecret,
  verifyMFAToken,
  generateBackupCodes,
  createSession,
  getValidSession,
  updateSessionActivity,
  invalidateSession,
  getUserWithPermissions,
  logSecurityEvent
};

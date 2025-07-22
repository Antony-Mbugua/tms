import express from 'express';
import { body, validationResult } from 'express-validator';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateMFASecret,
  verifyMFAToken,
  generateBackupCodes,
  createSession,
  getValidSession,
  invalidateSession,
  getUserWithPermissions,
  logSecurityEvent,
  bruteForceProtection,
  generateDeviceFingerprint,
  getClientIP,
  getGeoLocation,
  encrypt,
  decrypt
} from '../middleware/security.js';

import { executeQuery, executeTransaction } from '../config/database.js';
import logger from '../utils/logger.js';

const router = express.Router();

// =============================================
// VALIDATION RULES
// =============================================

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be a boolean'),
  body('mfaToken')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('MFA token must be 6 digits')
];

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('role')
    .isIn(['admin', 'dispatcher', 'driver', 'accountant', 'it_support'])
    .withMessage('Valid role is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .isLength({ min: 8 })
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];

// =============================================
// AUTHENTICATION ENDPOINTS
// =============================================

// Login endpoint
router.post('/login', bruteForceProtection.prevent, loginValidation, async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await logSecurityEvent(req, 'FAILED_LOGIN', 'medium', {
        reason: 'validation_failed',
        errors: errors.array()
      });
      
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { email, password, rememberMe = false, mfaToken } = req.body;
    const ip = getClientIP(req);
    const geoLocation = getGeoLocation(ip);
    const deviceFingerprint = generateDeviceFingerprint(req);

    // Get user with roles and permissions
    const [userRows] = await executeQuery(`
      SELECT u.*, 
             GROUP_CONCAT(DISTINCT r.name) as role_names,
             GROUP_CONCAT(DISTINCT p.name) as permission_names
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = TRUE
      LEFT JOIN roles r ON ur.role_id = r.id AND r.is_active = TRUE
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.email = ? AND u.is_active = TRUE
      GROUP BY u.id
    `, [email]);

    if (userRows.length === 0) {
      await logSecurityEvent(req, 'FAILED_LOGIN', 'medium', {
        email,
        reason: 'user_not_found',
        ip,
        geoLocation
      });
      
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = userRows[0];

    // Check if account is locked
    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      await logSecurityEvent(req, 'FAILED_LOGIN', 'high', {
        userId: user.id,
        email,
        reason: 'account_locked',
        lockedUntil: user.account_locked_until
      });
      
      return res.status(423).json({
        error: 'Account is temporarily locked',
        code: 'ACCOUNT_LOCKED',
        lockedUntil: user.account_locked_until
      });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      // Increment failed attempts
      const newFailedAttempts = user.failed_login_attempts + 1;
      let lockUntil = null;
      
      // Lock account after 5 failed attempts
      if (newFailedAttempts >= 5) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await executeQuery(`
        UPDATE users 
        SET failed_login_attempts = ?, account_locked_until = ?
        WHERE id = ?
      `, [newFailedAttempts, lockUntil, user.id]);

      await logSecurityEvent(req, 'FAILED_LOGIN', 'medium', {
        userId: user.id,
        email,
        reason: 'invalid_password',
        failedAttempts: newFailedAttempts,
        accountLocked: lockUntil !== null
      });
      
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
        ...(lockUntil && { accountLocked: true, lockedUntil: lockUntil })
      });
    }

    // Check MFA if enabled
    if (user.mfa_enabled) {
      if (!mfaToken) {
        return res.status(200).json({
          success: false,
          mfaRequired: true,
          message: 'MFA token required'
        });
      }

      // Verify MFA token
      const mfaSecret = decrypt(user.mfa_secret);
      const mfaValid = verifyMFAToken(mfaToken, mfaSecret);
      
      if (!mfaValid) {
        // Check backup codes
        let backupCodeValid = false;
        if (user.backup_codes) {
          const backupCodes = JSON.parse(decrypt(user.backup_codes) || '[]');
          const codeIndex = backupCodes.indexOf(mfaToken.toUpperCase());
          
          if (codeIndex !== -1) {
            // Remove used backup code
            backupCodes.splice(codeIndex, 1);
            await executeQuery(`
              UPDATE users 
              SET backup_codes = ?
              WHERE id = ?
            `, [encrypt(JSON.stringify(backupCodes)), user.id]);
            
            backupCodeValid = true;
            
            await logSecurityEvent(req, 'LOGIN', 'medium', {
              userId: user.id,
              method: 'backup_code_used',
              remainingBackupCodes: backupCodes.length
            });
          }
        }
        
        if (!backupCodeValid) {
          await logSecurityEvent(req, 'FAILED_LOGIN', 'medium', {
            userId: user.id,
            email,
            reason: 'invalid_mfa_token'
          });
          
          return res.status(401).json({
            error: 'Invalid MFA token',
            code: 'INVALID_MFA_TOKEN'
          });
        }
      }
    }

    // Reset failed login attempts
    await executeQuery(`
      UPDATE users 
      SET failed_login_attempts = 0, account_locked_until = NULL, last_login_at = NOW(), last_login_ip = ?
      WHERE id = ?
    `, [ip, user.id]);

    // Parse roles and permissions
    user.roles = user.role_names ? 
      user.role_names.split(',').map(name => ({ name: name.trim() })) : [];
    user.permissions = user.permission_names ? 
      user.permission_names.split(',').map(name => ({ name: name.trim() })) : [];

    // Create session
    const session = await createSession(user.id, req);

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      sessionId: session.id,
      roles: user.roles.map(r => r.name),
      deviceFingerprint
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in database (encrypted)
    await executeQuery(`
      UPDATE user_sessions 
      SET refresh_token = ?
      WHERE id = ?
    `, [encrypt(refreshToken), session.id]);

    // Log successful login
    await logSecurityEvent(req, 'LOGIN', 'low', {
      userId: user.id,
      sessionId: session.id,
      deviceFingerprint,
      geoLocation,
      mfaUsed: user.mfa_enabled,
      rememberMe
    });

    logger.auth('User logged in successfully', {
      userId: user.id,
      email: user.email,
      roles: user.roles.map(r => r.name),
      ip,
      userAgent: req.headers['user-agent']
    });

    // Prepare user data for response (remove sensitive fields)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      timezone: user.timezone,
      language: user.language,
      themePreference: user.theme_preference,
      hasTrainingAccess: user.has_training_access,
      trainingLevel: user.training_level,
      mfaEnabled: user.mfa_enabled,
      roles: user.roles,
      permissions: user.permissions,
      lastLoginAt: user.last_login_at,
      emailVerifiedAt: user.email_verified_at
    };

    // Set cookie for remember me
    if (rememberMe) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      accessToken,
      refreshToken: rememberMe ? undefined : refreshToken, // Don't send in response if using cookies
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      sessionId: session.id
    });

  } catch (error) {
    logger.logError(error, { endpoint: 'POST /api/auth/login' });
    
    await logSecurityEvent(req, 'SECURITY_VIOLATION', 'high', {
      error: error.message,
      endpoint: 'login'
    });

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const cookieToken = req.cookies?.refreshToken;
    
    const token = refreshToken || cookieToken;
    
    if (!token) {
      return res.status(401).json({
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);
    
    // Get session and validate
    const session = await getValidSession(decoded.sessionId);
    if (!session) {
      return res.status(401).json({
        error: 'Session invalid or expired',
        code: 'SESSION_INVALID'
      });
    }

    // Get updated user data
    const user = await getUserWithPermissions(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'User not found or inactive',
        code: 'USER_INACTIVE'
      });
    }

    // Generate new access token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      sessionId: session.id,
      roles: user.roles.map(r => r.name),
      deviceFingerprint: session.device_fingerprint
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    await logSecurityEvent(req, 'DATA_ACCESS', 'low', {
      userId: user.id,
      action: 'token_refresh',
      sessionId: session.id
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });

  } catch (error) {
    logger.logError(error, { endpoint: 'POST /api/auth/refresh' });
    
    res.status(401).json({
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = verifyToken(token);
        await invalidateSession(decoded.sessionId);
        
        await logSecurityEvent(req, 'LOGOUT', 'low', {
          userId: decoded.userId,
          sessionId: decoded.sessionId
        });
        
        logger.auth('User logged out', {
          userId: decoded.userId,
          sessionId: decoded.sessionId
        });
      } catch (error) {
        // Token might be expired, continue with logout
        logger.warn('Logout with invalid token:', error.message);
      }
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.logError(error, { endpoint: 'POST /api/auth/logout' });
    
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// =============================================
// MFA ENDPOINTS
// =============================================

// Generate MFA secret
router.post('/mfa/setup', async (req, res) => {
  try {
    // This endpoint should be protected by authentication middleware
    // For now, we'll require a valid session token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const decoded = verifyToken(token);
    const user = await getUserWithPermissions(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate MFA secret
    const secret = generateMFASecret(user.email);
    
    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();

    res.status(200).json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes,
      manualEntryKey: secret.base32
    });

  } catch (error) {
    logger.logError(error, { endpoint: 'POST /api/auth/mfa/setup' });
    
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Enable MFA
router.post('/mfa/enable', async (req, res) => {
  try {
    const { secret, token, backupCodes } = req.body;
    
    if (!secret || !token || !backupCodes) {
      return res.status(400).json({
        error: 'Secret, token, and backup codes are required',
        code: 'MISSING_PARAMETERS'
      });
    }

    // Verify token first
    const authHeader = req.headers['authorization'];
    const authToken = authHeader && authHeader.split(' ')[1];
    
    if (!authToken) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const decoded = verifyToken(authToken);
    const user = await getUserWithPermissions(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify MFA token
    const tokenValid = verifyMFAToken(token, secret);
    if (!tokenValid) {
      return res.status(400).json({
        error: 'Invalid MFA token',
        code: 'INVALID_MFA_TOKEN'
      });
    }

    // Encrypt and store MFA secret and backup codes
    const encryptedSecret = encrypt(secret);
    const encryptedBackupCodes = encrypt(JSON.stringify(backupCodes));

    await executeQuery(`
      UPDATE users 
      SET mfa_enabled = TRUE, mfa_secret = ?, backup_codes = ?
      WHERE id = ?
    `, [encryptedSecret, encryptedBackupCodes, user.id]);

    await logSecurityEvent(req, 'MFA_ENABLED', 'medium', {
      userId: user.id
    });

    logger.auth('MFA enabled', {
      userId: user.id,
      email: user.email
    });

    res.status(200).json({
      success: true,
      message: 'MFA enabled successfully'
    });

  } catch (error) {
    logger.logError(error, { endpoint: 'POST /api/auth/mfa/enable' });
    
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Disable MFA
router.post('/mfa/disable', async (req, res) => {
  try {
    const { password, mfaToken } = req.body;
    
    if (!password || !mfaToken) {
      return res.status(400).json({
        error: 'Password and MFA token are required',
        code: 'MISSING_PARAMETERS'
      });
    }

    const authHeader = req.headers['authorization'];
    const authToken = authHeader && authHeader.split(' ')[1];
    
    if (!authToken) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const decoded = verifyToken(authToken);
    const [userRows] = await executeQuery(`
      SELECT * FROM users WHERE id = ? AND is_active = TRUE
    `, [decoded.userId]);

    if (userRows.length === 0) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = userRows[0];

    // Verify password
    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        code: 'INVALID_PASSWORD'
      });
    }

    // Verify MFA token
    const mfaSecret = decrypt(user.mfa_secret);
    const tokenValid = verifyMFAToken(mfaToken, mfaSecret);
    
    if (!tokenValid) {
      return res.status(400).json({
        error: 'Invalid MFA token',
        code: 'INVALID_MFA_TOKEN'
      });
    }

    // Disable MFA
    await executeQuery(`
      UPDATE users 
      SET mfa_enabled = FALSE, mfa_secret = NULL, backup_codes = NULL
      WHERE id = ?
    `, [user.id]);

    await logSecurityEvent(req, 'MFA_DISABLED', 'medium', {
      userId: user.id
    });

    logger.auth('MFA disabled', {
      userId: user.id,
      email: user.email
    });

    res.status(200).json({
      success: true,
      message: 'MFA disabled successfully'
    });

  } catch (error) {
    logger.logError(error, { endpoint: 'POST /api/auth/mfa/disable' });
    
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// =============================================
// PASSWORD MANAGEMENT
// =============================================

// Change password
router.post('/change-password', changePasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const decoded = verifyToken(token);
    const [userRows] = await executeQuery(`
      SELECT * FROM users WHERE id = ? AND is_active = TRUE
    `, [decoded.userId]);

    if (userRows.length === 0) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = userRows[0];

    // Verify current password
    const passwordValid = await verifyPassword(currentPassword, user.password);
    if (!passwordValid) {
      await logSecurityEvent(req, 'SECURITY_VIOLATION', 'medium', {
        userId: user.id,
        action: 'invalid_current_password_change_attempt'
      });
      
      return res.status(401).json({
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await executeQuery(`
      UPDATE users 
      SET password = ?, password_changed_at = NOW(), must_change_password = FALSE
      WHERE id = ?
    `, [hashedNewPassword, user.id]);

    // Invalidate all other sessions for security
    await executeQuery(`
      UPDATE user_sessions 
      SET is_active = FALSE 
      WHERE user_id = ? AND id != ?
    `, [user.id, decoded.sessionId]);

    await logSecurityEvent(req, 'PASSWORD_CHANGE', 'medium', {
      userId: user.id
    });

    logger.auth('Password changed', {
      userId: user.id,
      email: user.email
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.logError(error, { endpoint: 'POST /api/auth/change-password' });
    
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// =============================================
// SESSION MANAGEMENT
// =============================================

// Get active sessions
router.get('/sessions', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const decoded = verifyToken(token);
    
    const [sessions] = await executeQuery(`
      SELECT id, ip_address, user_agent, location_data, login_method,
             created_at, last_activity, expires_at, is_suspicious, risk_score
      FROM user_sessions 
      WHERE user_id = ? AND is_active = TRUE
      ORDER BY last_activity DESC
    `, [decoded.userId]);

    // Parse location data and add current session indicator
    const sessionData = sessions.map(session => ({
      ...session,
      location_data: session.location_data ? JSON.parse(session.location_data) : null,
      is_current: session.id === decoded.sessionId
    }));

    res.status(200).json({
      success: true,
      sessions: sessionData
    });

  } catch (error) {
    logger.logError(error, { endpoint: 'GET /api/auth/sessions' });
    
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Revoke session
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const decoded = verifyToken(token);
    
    // Don't allow revoking current session
    if (sessionId === decoded.sessionId) {
      return res.status(400).json({
        error: 'Cannot revoke current session',
        code: 'CANNOT_REVOKE_CURRENT_SESSION'
      });
    }

    // Verify session belongs to user
    const [sessionRows] = await executeQuery(`
      SELECT id FROM user_sessions 
      WHERE id = ? AND user_id = ? AND is_active = TRUE
    `, [sessionId, decoded.userId]);

    if (sessionRows.length === 0) {
      return res.status(404).json({
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    await invalidateSession(sessionId);

    await logSecurityEvent(req, 'DATA_MODIFICATION', 'medium', {
      userId: decoded.userId,
      action: 'session_revoked',
      revokedSessionId: sessionId
    });

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully'
    });

  } catch (error) {
    logger.logError(error, { endpoint: 'DELETE /api/auth/sessions/:sessionId' });
    
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;

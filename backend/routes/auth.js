import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { 
  generatePasswordResetToken, 
  hashPasswordResetToken, 
  generateVerificationCode,
  hashSPII,
  validateSPII,
  logSPIIAccess 
} from '../utils/spii.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const users = await query(
      'SELECT id, email, password, first_name, last_name, phone, role, is_active, is_online, has_training_access, mfa_enabled, mfa_secret FROM users WHERE email = ?',
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
    let isValidPassword = false;

    // Check if we're using mock database in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const { mockPasswordCheck } = await import('../utils/mockDatabase.js');
        isValidPassword = mockPasswordCheck(password, email.toLowerCase());
        console.log('🔐 Mock password validation result:', isValidPassword);
      } catch (mockError) {
        // Fall back to regular bcrypt if mock fails
        isValidPassword = await bcrypt.compare(password, user.password_hash);
      }
    } else {
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    }

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

    // Generate JWT token with remember me option
    const tokenExpiry = rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '24h');
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
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
    const sessionTimeout = rememberMe ? 30 * 24 * 60 : (parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 480);
    await query(
      'INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
      [user.id, token.substring(0, 32), req.ip, req.get('User-Agent'), sessionTimeout]
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

// Password reset request endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateSPII(email, 'email')) {
      return res.status(400).json({ 
        error: 'Valid email address is required' 
      });
    }

    // Find user by email
    const users = await query(
      'SELECT id, email, first_name, phone FROM users WHERE email = ? AND is_active = TRUE',
      [email.toLowerCase()]
    );

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (users.length > 0) {
      const user = users[0];
      
      // Generate secure reset token
      const resetToken = generatePasswordResetToken();
      const tokenHash = hashPasswordResetToken(resetToken);
      
      // Store reset token in database (expires in 1 hour)
      await query(
        'INSERT INTO password_reset_tokens (user_id, token, token_hash, expires_at, ip_address, user_agent) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), ?, ?)',
        [user.id, resetToken, tokenHash, req.ip, req.get('User-Agent')]
      );

      // Generate SMS verification code if phone number exists
      if (user.phone) {
        const verificationCode = generateVerificationCode(6);
        const codeHash = hashSPII(verificationCode);
        
        await query(
          'INSERT INTO verification_attempts (user_id, verification_type, contact_method, contact_hash, verification_code_hash, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), ?, ?)',
          [user.id, 'sms', `***-***-${user.phone.slice(-4)}`, hashSPII(user.phone), codeHash, req.ip, req.get('User-Agent')]
        );

        // In production, send SMS with verification code
        console.log(`SMS code for ${user.phone}: ${verificationCode}`);
      }

      // Log password reset request
      await query(
        'INSERT INTO security_events (user_id, event_type, ip_address, user_agent, risk_level, details) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, 'password_reset_requested', req.ip, req.get('User-Agent'), 'medium', JSON.stringify({ method: 'email' })]
      );

      // In production, send email with reset link
      console.log(`Reset link for ${user.email}: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent you a password reset link.'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Verify reset token endpoint
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Reset token is required' 
      });
    }

    const tokenHash = hashPasswordResetToken(token);
    
    // Check if token exists and is not expired
    const tokens = await query(
      'SELECT prt.*, u.email, u.first_name FROM password_reset_tokens prt JOIN users u ON prt.user_id = u.id WHERE prt.token_hash = ? AND prt.expires_at > NOW() AND prt.used_at IS NULL',
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      email: tokens[0].email
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, verificationCode } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }

    const tokenHash = hashPasswordResetToken(token);
    
    // Verify reset token
    const tokens = await query(
      'SELECT prt.*, u.id as user_id, u.email FROM password_reset_tokens prt JOIN users u ON prt.user_id = u.id WHERE prt.token_hash = ? AND prt.expires_at > NOW() AND prt.used_at IS NULL',
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    const resetRecord = tokens[0];

    // If verification code is provided, verify it
    if (verificationCode) {
      const codeHash = hashSPII(verificationCode);
      const verifications = await query(
        'SELECT * FROM verification_attempts WHERE user_id = ? AND verification_code_hash = ? AND expires_at > NOW() AND verified_at IS NULL',
        [resetRecord.user_id, codeHash]
      );

      if (verifications.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid verification code' 
        });
      }

      // Mark verification as used
      await query(
        'UPDATE verification_attempts SET verified_at = NOW() WHERE id = ?',
        [verifications[0].id]
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    // Update user password
    await query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [passwordHash, resetRecord.user_id]
    );

    // Mark reset token as used
    await query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?',
      [resetRecord.id]
    );

    // Log password change
    await query(
      'INSERT INTO security_events (user_id, event_type, ip_address, user_agent, risk_level, details) VALUES (?, ?, ?, ?, ?, ?)',
      [resetRecord.user_id, 'password_changed', req.ip, req.get('User-Agent'), 'low', JSON.stringify({ method: 'reset' })]
    );

    // Invalidate all existing sessions for security
    await query(
      'DELETE FROM user_sessions WHERE user_id = ?',
      [resetRecord.user_id]
    );

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
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
    
    // Get user data with preferences
    const users = await query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.is_active, u.is_online, 
             u.has_training_access, u.mfa_enabled, u.theme_preference, u.theme_color,
             up.theme_mode, up.theme_color as preferred_color, up.language, up.timezone
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.id = ? AND u.is_active = TRUE
    `, [decoded.userId]);

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
      mfaEnabled: user.mfa_enabled,
      themePreference: user.theme_preference || user.theme_mode,
      themeColor: user.theme_color || user.preferred_color
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

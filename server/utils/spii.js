import crypto from 'crypto';
import { query } from '../config/database.js';

// SPII (Sensitive Personal Identifiable Information) Encryption Utilities
// This module handles encryption/decryption and hashing of sensitive data

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, this is always 16
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;

/**
 * Generate a secure random salt
 */
export const generateSalt = () => {
  return crypto.randomBytes(SALT_LENGTH).toString('hex');
};

/**
 * Derive encryption key from master key and salt
 */
const deriveKey = (masterKey, salt) => {
  return crypto.pbkdf2Sync(masterKey, salt, 100000, 32, 'sha512');
};

/**
 * Get the active SPII encryption key from database
 */
const getActiveEncryptionKey = async () => {
  try {
    const keys = await query(
      'SELECT key_value, salt FROM spii_encryption_keys WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1'
    );
    
    if (keys.length === 0) {
      throw new Error('No active SPII encryption key found');
    }
    
    return {
      key: keys[0].key_value,
      salt: keys[0].salt
    };
  } catch (error) {
    console.error('Error getting encryption key:', error);
    throw new Error('Failed to retrieve encryption key');
  }
};

/**
 * Encrypt sensitive data
 * @param {string} plaintext - The data to encrypt
 * @param {string} purpose - Purpose of encryption (for audit logging)
 * @returns {Promise<string>} - Base64 encoded encrypted data with IV and tag
 */
export const encryptSPII = async (plaintext, purpose = 'data_storage') => {
  try {
    if (!plaintext) return null;
    
    const { key: masterKey, salt } = await getActiveEncryptionKey();
    const derivedKey = deriveKey(masterKey, salt);
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, derivedKey);
    cipher.setAAD(Buffer.from(purpose, 'utf8'));
    
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const tag = cipher.getAuthTag();
    
    // Combine IV + encrypted data + tag
    const combined = Buffer.concat([iv, encrypted, tag]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('SPII encryption error:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {string} purpose - Purpose of decryption (for audit logging)
 * @returns {Promise<string>} - Decrypted plaintext
 */
export const decryptSPII = async (encryptedData, purpose = 'data_retrieval') => {
  try {
    if (!encryptedData) return null;
    
    const { key: masterKey, salt } = await getActiveEncryptionKey();
    const derivedKey = deriveKey(masterKey, salt);
    
    const combined = Buffer.from(encryptedData, 'base64');
    
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH, -TAG_LENGTH);
    const tag = combined.slice(-TAG_LENGTH);
    
    const decipher = crypto.createDecipher(ALGORITHM, derivedKey);
    decipher.setAAD(Buffer.from(purpose, 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('SPII decryption error:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
};

/**
 * Create a secure hash of sensitive data for indexing/searching
 * @param {string} data - The data to hash
 * @param {string} pepper - Additional secret for hashing
 * @returns {string} - SHA256 hash in hex format
 */
export const hashSPII = (data, pepper = process.env.SPII_HASH_PEPPER || 'default_pepper') => {
  if (!data) return null;
  
  // Use HMAC for additional security
  const hmac = crypto.createHmac('sha256', pepper);
  hmac.update(data.toString());
  return hmac.digest('hex');
};

/**
 * Mask sensitive data for display purposes
 * @param {string} data - The data to mask
 * @param {string} type - Type of data (phone, account, email, etc.)
 * @returns {string} - Masked data
 */
export const maskSPII = (data, type = 'generic') => {
  if (!data) return '';
  
  switch (type) {
    case 'phone':
      // Format: (XXX) XXX-1234 or XXX-XXX-1234
      if (data.length === 10) {
        return `(${data.slice(0, 3)}) ***-${data.slice(-4)}`;
      } else if (data.length >= 10) {
        return `${data.slice(0, 3)}-***-${data.slice(-4)}`;
      }
      return '***-***-' + data.slice(-4);
      
    case 'account':
      // Format: ****1234
      return '****' + data.slice(-4);
      
    case 'email':
      // Format: j***@example.com
      const [local, domain] = data.split('@');
      if (local.length <= 2) {
        return '*'.repeat(local.length) + '@' + domain;
      }
      return local[0] + '*'.repeat(local.length - 2) + local.slice(-1) + '@' + domain;
      
    case 'ssn':
      // Format: ***-**-1234
      return '***-**-' + data.slice(-4);
      
    case 'routing':
      // Format: ****5678
      return '****' + data.slice(-4);
      
    default:
      // Generic masking - show first and last character
      if (data.length <= 2) {
        return '*'.repeat(data.length);
      }
      return data[0] + '*'.repeat(data.length - 2) + data.slice(-1);
  }
};

/**
 * Log SPII access for audit purposes
 * @param {number} userId - User accessing the data
 * @param {string} table - Table containing SPII
 * @param {string} field - Field accessed
 * @param {number} entityId - ID of the entity
 * @param {string} operation - Type of operation
 * @param {string} reason - Reason for access
 * @param {string} ipAddress - IP address of user
 * @param {string} userAgent - User agent string
 */
export const logSPIIAccess = async (userId, table, field, entityId, operation, reason = '', ipAddress = '', userAgent = '') => {
  try {
    await query(`
      INSERT INTO spii_access_log 
      (user_id, accessed_table, accessed_field, entity_id, operation, reason, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, table, field, entityId, operation, reason, ipAddress, userAgent]);
  } catch (error) {
    console.error('Failed to log SPII access:', error);
    // Don't throw error here as it shouldn't break the main operation
  }
};

/**
 * Validate SPII data before processing
 * @param {string} data - Data to validate
 * @param {string} type - Type of data
 * @returns {boolean} - Whether data is valid
 */
export const validateSPII = (data, type) => {
  if (!data) return false;
  
  const patterns = {
    phone: /^[\d\s\-\(\)\+\.]{10,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    account: /^[\w\-]{4,}$/,
    ssn: /^\d{3}-?\d{2}-?\d{4}$/,
    routing: /^\d{9}$/
  };
  
  return patterns[type] ? patterns[type].test(data) : true;
};

/**
 * Generate secure verification codes for password reset
 * @param {number} length - Length of the code
 * @returns {string} - Random verification code
 */
export const generateVerificationCode = (length = 6) => {
  const chars = '0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(crypto.randomInt(0, chars.length));
  }
  
  return code;
};

/**
 * Generate secure password reset token
 * @returns {string} - Secure random token
 */
export const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash password reset token for storage
 * @param {string} token - Token to hash
 * @returns {string} - Hashed token
 */
export const hashPasswordResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export default {
  encryptSPII,
  decryptSPII,
  hashSPII,
  maskSPII,
  logSPIIAccess,
  validateSPII,
  generateVerificationCode,
  generatePasswordResetToken,
  hashPasswordResetToken,
  generateSalt
};

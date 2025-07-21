-- AOL TMS Database Schema Updates
-- Add phone numbers, account numbers, and SPII fields

USE aol_tms;

-- Update users table to include additional fields
ALTER TABLE users 
ADD COLUMN phone_hash VARCHAR(255) AFTER phone,
ADD COLUMN account_number VARCHAR(50) UNIQUE AFTER phone_hash,
ADD COLUMN account_number_hash VARCHAR(255) AFTER account_number,
ADD COLUMN emergency_contact_name VARCHAR(255),
ADD COLUMN emergency_contact_phone VARCHAR(20),
ADD COLUMN emergency_contact_phone_hash VARCHAR(255),
ADD COLUMN password_reset_token VARCHAR(255),
ADD COLUMN password_reset_expires TIMESTAMP NULL,
ADD COLUMN theme_preference ENUM('light', 'dark', 'system') DEFAULT 'dark',
ADD COLUMN theme_color ENUM('blue', 'green', 'orange', 'purple', 'red', 'teal', 'indigo', 'pink') DEFAULT 'blue';

-- Add indexes for new fields
ALTER TABLE users 
ADD INDEX idx_phone_hash (phone_hash),
ADD INDEX idx_account_number (account_number),
ADD INDEX idx_account_number_hash (account_number_hash),
ADD INDEX idx_password_reset_token (password_reset_token);

-- Create payment accounts table for financial transactions
CREATE TABLE payment_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_type ENUM('driver_pay', 'company_expense', 'broker_payment', 'invoice_collection') NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_number_hash VARCHAR(255) NOT NULL,
    routing_number VARCHAR(20),
    routing_number_hash VARCHAR(255),
    bank_name VARCHAR(255),
    account_holder_name VARCHAR(255),
    account_holder_name_hash VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_account_type (account_type),
    INDEX idx_account_number_hash (account_number_hash),
    INDEX idx_routing_number_hash (routing_number_hash)
);

-- Create payment transactions table
CREATE TABLE payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_account_id INT,
    to_account_id INT,
    transaction_type ENUM('driver_payment', 'expense_reimbursement', 'invoice_payment', 'broker_payment') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    reference_number VARCHAR(100),
    reference_type ENUM('load', 'invoice', 'expense') NULL,
    reference_id INT NULL,
    description TEXT,
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    scheduled_date DATE,
    processed_date TIMESTAMP NULL,
    created_by INT NOT NULL,
    approved_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES payment_accounts(id),
    FOREIGN KEY (to_account_id) REFERENCES payment_accounts(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_reference (reference_type, reference_id)
);

-- Create SPII (Sensitive Personal Identifiable Information) encryption keys table
CREATE TABLE spii_encryption_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) NOT NULL UNIQUE,
    key_value TEXT NOT NULL,
    algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    salt VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    rotation_count INT DEFAULT 0,
    last_rotation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_key_name (key_name),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at)
);

-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Create SMS/Email verification table for password resets
CREATE TABLE verification_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    verification_type ENUM('email', 'sms', 'phone_call') NOT NULL,
    contact_method VARCHAR(255) NOT NULL, -- masked email/phone
    contact_hash VARCHAR(255) NOT NULL,   -- hashed actual contact
    verification_code VARCHAR(10),
    verification_code_hash VARCHAR(255),
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    verified_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_contact_hash (contact_hash),
    INDEX idx_expires_at (expires_at)
);

-- Create user preferences table for UI customization
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    theme_mode ENUM('light', 'dark', 'system') DEFAULT 'dark',
    theme_color ENUM('blue', 'green', 'orange', 'purple', 'red', 'teal', 'indigo', 'pink') DEFAULT 'blue',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    currency VARCHAR(3) DEFAULT 'USD',
    dashboard_layout JSON,
    notification_preferences JSON,
    privacy_settings JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create audit log for SPII access
CREATE TABLE spii_access_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    accessed_table VARCHAR(100) NOT NULL,
    accessed_field VARCHAR(100) NOT NULL,
    entity_id INT NOT NULL,
    operation ENUM('view', 'update', 'delete', 'export') NOT NULL,
    reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_accessed_table (accessed_table),
    INDEX idx_operation (operation),
    INDEX idx_accessed_at (accessed_at)
);

-- Insert default SPII encryption key (for development - replace in production)
INSERT INTO spii_encryption_keys (key_name, key_value, salt, created_by) 
SELECT 'default_spii_key', 
       'dev_encryption_key_change_in_production', 
       'dev_salt_change_in_production',
       id 
FROM users WHERE role = 'admin' LIMIT 1;

-- Add some company payment accounts
INSERT INTO payment_accounts (user_id, account_type, account_name, account_number, account_number_hash, bank_name, account_holder_name, account_holder_name_hash, is_primary) 
SELECT 
    u.id,
    'company_expense',
    'AOL Main Operating Account',
    '****1234',
    SHA2(CONCAT('company_operating_account_1234567890', 'salt'), 256),
    'First National Bank',
    'All Over Logistics LLC',
    SHA2(CONCAT('All Over Logistics LLC', 'salt'), 256),
    TRUE
FROM users u WHERE u.role = 'admin' LIMIT 1;

-- Create view for user profile with masked SPII
CREATE VIEW user_profiles_masked AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    CONCAT(LEFT(u.phone, 3), '-***-', RIGHT(u.phone, 4)) as phone_masked,
    CONCAT('****', RIGHT(u.account_number, 4)) as account_number_masked,
    u.role,
    u.is_active,
    u.is_online,
    u.has_training_access,
    u.mfa_enabled,
    u.theme_preference,
    u.theme_color,
    u.last_login,
    u.created_at,
    up.theme_mode,
    up.theme_color as preferred_color,
    up.language,
    up.timezone,
    up.date_format,
    up.currency
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id;

COMMIT;

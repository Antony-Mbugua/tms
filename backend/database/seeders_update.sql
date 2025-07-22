-- AOL TMS Database Seeders Update
-- Add phone numbers, account numbers, and SPII data

USE aol_tms;

-- First run the schema updates
SOURCE schema_update.sql;

-- Update existing users with phone numbers and account numbers
UPDATE users SET 
  phone = '+1-555-0001',
  phone_hash = SHA2(CONCAT('+1-555-0001', 'spii_salt'), 256),
  account_number = 'ACC-ADM-001',
  account_number_hash = SHA2(CONCAT('ACC-ADM-001', 'spii_salt'), 256),
  emergency_contact_name = 'Jane Administrator',
  emergency_contact_phone = '+1-555-0011',
  emergency_contact_phone_hash = SHA2(CONCAT('+1-555-0011', 'spii_salt'), 256),
  theme_preference = 'dark',
  theme_color = 'blue'
WHERE email = 'admin@aol.com';

UPDATE users SET 
  phone = '+1-555-0002',
  phone_hash = SHA2(CONCAT('+1-555-0002', 'spii_salt'), 256),
  account_number = 'ACC-DIS-002',
  account_number_hash = SHA2(CONCAT('ACC-DIS-002', 'spii_salt'), 256),
  emergency_contact_name = 'Mike Johnson',
  emergency_contact_phone = '+1-555-0012',
  emergency_contact_phone_hash = SHA2(CONCAT('+1-555-0012', 'spii_salt'), 256),
  theme_preference = 'dark',
  theme_color = 'green'
WHERE email = 'dispatcher@aol.com';

UPDATE users SET 
  phone = '+1-555-0003',
  phone_hash = SHA2(CONCAT('+1-555-0003', 'spii_salt'), 256),
  account_number = 'ACC-DRV-003',
  account_number_hash = SHA2(CONCAT('ACC-DRV-003', 'spii_salt'), 256),
  emergency_contact_name = 'Sarah Williams',
  emergency_contact_phone = '+1-555-0013',
  emergency_contact_phone_hash = SHA2(CONCAT('+1-555-0013', 'spii_salt'), 256),
  theme_preference = 'dark',
  theme_color = 'orange'
WHERE email = 'driver@aol.com';

UPDATE users SET 
  phone = '+1-555-0004',
  phone_hash = SHA2(CONCAT('+1-555-0004', 'spii_salt'), 256),
  account_number = 'ACC-ACC-004',
  account_number_hash = SHA2(CONCAT('ACC-ACC-004', 'spii_salt'), 256),
  emergency_contact_name = 'Robert Davis',
  emergency_contact_phone = '+1-555-0014',
  emergency_contact_phone_hash = SHA2(CONCAT('+1-555-0014', 'spii_salt'), 256),
  theme_preference = 'light',
  theme_color = 'purple'
WHERE email = 'accountant@aol.com';

UPDATE users SET 
  phone = '+1-555-0005',
  phone_hash = SHA2(CONCAT('+1-555-0005', 'spii_salt'), 256),
  account_number = 'ACC-IT-005',
  account_number_hash = SHA2(CONCAT('ACC-IT-005', 'spii_salt'), 256),
  emergency_contact_name = 'Linda Chen',
  emergency_contact_phone = '+1-555-0015',
  emergency_contact_phone_hash = SHA2(CONCAT('+1-555-0015', 'spii_salt'), 256),
  theme_preference = 'system',
  theme_color = 'indigo'
WHERE email = 'it@aol.com';

-- Add driver payment accounts
INSERT INTO payment_accounts (user_id, account_type, account_name, account_number, account_number_hash, routing_number, routing_number_hash, bank_name, account_holder_name, account_holder_name_hash, is_primary) VALUES
((SELECT id FROM users WHERE email = 'driver@aol.com'), 'driver_pay', 'Driver Pay Account', '1234567890', SHA2(CONCAT('1234567890', 'spii_salt'), 256), '123456789', SHA2(CONCAT('123456789', 'spii_salt'), 256), 'Driver Credit Union', 'Mike Williams', SHA2(CONCAT('Mike Williams', 'spii_salt'), 256), TRUE),
((SELECT id FROM users WHERE email = 'driver2@aol.com'), 'driver_pay', 'Driver Pay Account', '2345678901', SHA2(CONCAT('2345678901', 'spii_salt'), 256), '234567890', SHA2(CONCAT('234567890', 'spii_salt'), 256), 'Community Bank', 'Robert Martinez', SHA2(CONCAT('Robert Martinez', 'spii_salt'), 256), TRUE),
((SELECT id FROM users WHERE email = 'driver3@aol.com'), 'driver_pay', 'Driver Pay Account', '3456789012', SHA2(CONCAT('3456789012', 'spii_salt'), 256), '345678901', SHA2(CONCAT('345678901', 'spii_salt'), 256), 'Local Bank', 'Carlos Rodriguez', SHA2(CONCAT('Carlos Rodriguez', 'spii_salt'), 256), TRUE);

-- Add broker payment accounts for invoicing
INSERT INTO payment_accounts (user_id, account_type, account_name, account_number, account_number_hash, bank_name, account_holder_name, account_holder_name_hash, is_primary) VALUES
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'invoice_collection', 'ABC Logistics Receivables', '****1001', SHA2(CONCAT('broker_abc_receivables_1001', 'spii_salt'), 256), 'ABC Bank', 'ABC Logistics Inc', SHA2(CONCAT('ABC Logistics Inc', 'spii_salt'), 256), FALSE),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'invoice_collection', 'XYZ Freight Receivables', '****1002', SHA2(CONCAT('broker_xyz_receivables_1002', 'spii_salt'), 256), 'XYZ Bank', 'XYZ Freight Solutions', SHA2(CONCAT('XYZ Freight Solutions', 'spii_salt'), 256), FALSE),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'invoice_collection', 'DEF Transport Receivables', '****1003', SHA2(CONCAT('broker_def_receivables_1003', 'spii_salt'), 256), 'DEF Bank', 'DEF Transport Co', SHA2(CONCAT('DEF Transport Co', 'spii_salt'), 256), FALSE);

-- Insert user preferences for existing users
INSERT INTO user_preferences (user_id, theme_mode, theme_color, timezone, date_format, currency, notification_preferences, privacy_settings) VALUES
((SELECT id FROM users WHERE email = 'admin@aol.com'), 'dark', 'blue', 'America/New_York', 'MM/DD/YYYY', 'USD', 
 JSON_OBJECT('email', true, 'sms', true, 'push', true, 'security_alerts', true),
 JSON_OBJECT('data_sharing', false, 'analytics', true, 'marketing', false, 'profile_visibility', 'team')),
 
((SELECT id FROM users WHERE email = 'dispatcher@aol.com'), 'dark', 'green', 'America/New_York', 'MM/DD/YYYY', 'USD',
 JSON_OBJECT('email', true, 'sms', false, 'push', true, 'security_alerts', true),
 JSON_OBJECT('data_sharing', true, 'analytics', true, 'marketing', true, 'profile_visibility', 'team')),
 
((SELECT id FROM users WHERE email = 'driver@aol.com'), 'dark', 'orange', 'America/Chicago', 'MM/DD/YYYY', 'USD',
 JSON_OBJECT('email', true, 'sms', true, 'push', true, 'security_alerts', false),
 JSON_OBJECT('data_sharing', false, 'analytics', false, 'marketing', false, 'profile_visibility', 'private')),
 
((SELECT id FROM users WHERE email = 'accountant@aol.com'), 'light', 'purple', 'America/New_York', 'MM/DD/YYYY', 'USD',
 JSON_OBJECT('email', true, 'sms', false, 'push', false, 'security_alerts', true),
 JSON_OBJECT('data_sharing', false, 'analytics', true, 'marketing', false, 'profile_visibility', 'team')),
 
((SELECT id FROM users WHERE email = 'it@aol.com'), 'system', 'indigo', 'America/New_York', 'MM/DD/YYYY', 'USD',
 JSON_OBJECT('email', true, 'sms', true, 'push', true, 'security_alerts', true),
 JSON_OBJECT('data_sharing', false, 'analytics', true, 'marketing', false, 'profile_visibility', 'private'));

-- Add sample payment transactions
INSERT INTO payment_transactions (from_account_id, to_account_id, transaction_type, amount, reference_type, reference_id, description, status, scheduled_date, created_by) VALUES
(1, 2, 'driver_payment', 1250.00, 'load', 1, 'Payment for load RC-2024-001', 'completed', CURDATE(), (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
(1, 3, 'driver_payment', 1600.00, 'load', 2, 'Payment for load RC-2024-002', 'processing', CURDATE(), (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
(4, 1, 'invoice_payment', 2625.00, 'invoice', 1, 'Payment from ABC Logistics - Invoice INV-2024-001', 'completed', CURDATE() - INTERVAL 1 DAY, (SELECT id FROM users WHERE role = 'accountant' LIMIT 1));

-- Add sample SPII access logs
INSERT INTO spii_access_log (user_id, accessed_table, accessed_field, entity_id, operation, reason, ip_address) VALUES
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'users', 'phone', 3, 'view', 'Emergency contact verification', '192.168.1.100'),
((SELECT id FROM users WHERE role = 'accountant' LIMIT 1), 'payment_accounts', 'account_number', 2, 'view', 'Payment processing', '192.168.1.104'),
((SELECT id FROM users WHERE role = 'it_support' LIMIT 1), 'users', 'phone_hash', 5, 'view', 'Security audit', '192.168.1.105');

-- Insert additional security events for password reset testing
INSERT INTO security_events (user_id, event_type, ip_address, user_agent, risk_level, details, timestamp) VALUES
((SELECT id FROM users WHERE email = 'driver@aol.com'), 'password_reset_requested', '192.168.1.150', 'Mozilla/5.0 Test Browser', 'medium', JSON_OBJECT('method', 'email'), NOW() - INTERVAL 1 HOUR),
((SELECT id FROM users WHERE email = 'dispatcher@aol.com'), 'mfa_setup', '192.168.1.102', 'Mozilla/5.0 Test Browser', 'low', JSON_OBJECT('method', 'google_authenticator'), NOW() - INTERVAL 2 HOUR);

-- Add performance metrics for payment processing
INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, entity_type, entity_id, recorded_at) VALUES
('payment_processing_time', 2.5, 'seconds', 'transactions', 1, NOW()),
('payment_processing_time', 1.8, 'seconds', 'transactions', 2, NOW()),
('payment_success_rate', 98.5, 'percentage', 'system', 1, NOW()),
('average_transaction_amount', 1875.00, 'USD', 'system', 1, NOW());

COMMIT;

-- Display updated user information with masked SPII
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  CONCAT(LEFT(u.phone, 3), '-***-', RIGHT(u.phone, 4)) as phone_masked,
  CONCAT('****', RIGHT(u.account_number, 4)) as account_number_masked,
  u.role,
  u.theme_preference,
  u.theme_color,
  up.theme_mode,
  up.notification_preferences,
  up.privacy_settings
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id
WHERE u.is_active = TRUE
ORDER BY u.role, u.created_at;

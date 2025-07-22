-- AOL TMS Database Seed Data
-- Includes test users with bcrypt hashed passwords
-- Compatible with XAMPP MySQL

USE aol_tms;

-- Clear existing data (for development only)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE training_progress;
TRUNCATE TABLE training_modules;
TRUNCATE TABLE notifications;
TRUNCATE TABLE documents;
TRUNCATE TABLE expenses;
TRUNCATE TABLE invoices;
TRUNCATE TABLE loads;
TRUNCATE TABLE trucks;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE security_events;
TRUNCATE TABLE user_sessions;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert test users with bcrypt hashed passwords (password: admin123 for all)
-- bcrypt hash with 12 rounds for 'admin123'
INSERT INTO users (
    email, password, first_name, last_name, phone, role, employee_id, department,
    is_active, is_verified, must_change_password, theme_mode, theme_color
) VALUES
-- Admin User
('admin@alloverlogistics.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeeDUGd/JQfYxdnOK', 
 'System', 'Administrator', '+1-555-0001', 'admin', 'EMP001', 'Administration',
 TRUE, TRUE, FALSE, 'dark', 'blue'),

-- Dispatcher
('dispatcher@alloverlogistics.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeeDUGd/JQfYxdnOK',
 'John', 'Dispatcher', '+1-555-0002', 'dispatcher', 'EMP002', 'Operations',
 TRUE, TRUE, FALSE, 'light', 'emerald'),

-- Driver
('driver@alloverlogistics.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeeDUGd/JQfYxdnOK',
 'Mike', 'Johnson', '+1-555-0003', 'driver', 'EMP003', 'Transportation',
 TRUE, TRUE, FALSE, 'system', 'orange'),

-- Accountant
('accountant@alloverlogistics.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeeDUGd/JQfYxdnOK',
 'Sarah', 'Miller', '+1-555-0004', 'accountant', 'EMP004', 'Finance',
 TRUE, TRUE, FALSE, 'light', 'purple'),

-- IT Support
('it@alloverlogistics.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeeDUGd/JQfYxdnOK',
 'David', 'Wilson', '+1-555-0005', 'it_support', 'EMP005', 'Information Technology',
 TRUE, TRUE, FALSE, 'dark', 'slate');

-- Insert sample trucks
INSERT INTO trucks (
    truck_number, license_plate, vin_number, make, model, year, color,
    gross_weight, max_payload, fuel_type, status, assigned_driver_id,
    purchase_date, current_mileage, created_by
) VALUES
('TRK001', 'AOL001', '1HGBH41JXMN109186', 'Freightliner', 'Cascadia', 2022, 'Blue',
 80000, 34000, 'diesel', 'active', 3, '2022-01-15', 45000, 1),

('TRK002', 'AOL002', '1HGBH41JXMN109187', 'Peterbilt', '579', 2021, 'Red',
 80000, 34000, 'diesel', 'active', NULL, '2021-06-20', 62000, 1),

('TRK003', 'AOL003', '1HGBH41JXMN109188', 'Kenworth', 'T680', 2023, 'White',
 80000, 34000, 'diesel', 'maintenance', NULL, '2023-03-10', 12000, 1);

-- Insert sample loads
INSERT INTO loads (
    load_number, customer_name, customer_contact, customer_phone,
    pickup_address, pickup_city, pickup_state, pickup_zip,
    delivery_address, delivery_city, delivery_state, delivery_zip,
    pickup_date, delivery_date, commodity, weight, pieces,
    status, rate, assigned_driver_id, assigned_truck_id, dispatcher_id, created_by
) VALUES
('LD001', 'ABC Manufacturing', 'Tom Smith', '+1-555-1001',
 '123 Industrial Blvd', 'Chicago', 'IL', '60601',
 '456 Warehouse St', 'Detroit', 'MI', '48201',
 '2024-01-20', '2024-01-22', 'Machine Parts', 15000.00, 5,
 'assigned', 2500.00, 3, 1, 2, 1),

('LD002', 'XYZ Distributors', 'Lisa Johnson', '+1-555-1002',
 '789 Commerce Ave', 'Milwaukee', 'WI', '53201',
 '321 Distribution Dr', 'Minneapolis', 'MN', '55401',
 '2024-01-25', '2024-01-27', 'Consumer Goods', 22000.00, 15,
 'posted', 3200.00, NULL, NULL, 2, 1);

-- Insert sample invoices
INSERT INTO invoices (
    invoice_number, load_id, bill_to_company, bill_to_contact, bill_to_email,
    invoice_date, due_date, subtotal, tax_rate, tax_amount, total_amount,
    status, created_by
) VALUES
('INV001', 1, 'ABC Manufacturing', 'Tom Smith', 'tom.smith@abcmfg.com',
 '2024-01-23', '2024-02-22', 2500.00, 0.0875, 218.75, 2718.75,
 'sent', 4),

('INV002', 2, 'XYZ Distributors', 'Lisa Johnson', 'lisa.j@xyzdist.com',
 '2024-01-28', '2024-02-27', 3200.00, 0.0875, 280.00, 3480.00,
 'draft', 4);

-- Insert sample expenses
INSERT INTO expenses (
    expense_number, category, description, amount, expense_date,
    truck_id, driver_id, vendor, status, created_by
) VALUES
('EXP001', 'fuel', 'Diesel fuel - Chicago to Detroit', 450.75, '2024-01-20',
 1, 3, 'Shell Gas Station', 'approved', 3),

('EXP002', 'maintenance', 'Oil change and inspection', 285.50, '2024-01-18',
 1, 3, 'Freightliner Service Center', 'pending', 3),

('EXP003', 'tolls', 'Highway tolls - Interstate route', 67.25, '2024-01-20',
 1, 3, 'Illinois Tollway', 'approved', 3);

-- Insert training modules
INSERT INTO training_modules (
    title, description, content, required_for_roles, difficulty_level,
    estimated_duration, is_active, is_mandatory, created_by
) VALUES
('DOT Safety Regulations', 'Comprehensive overview of Department of Transportation safety requirements',
 'This module covers federal safety regulations...', '["driver", "dispatcher"]', 'intermediate',
 120, TRUE, TRUE, 5),

('Customer Service Excellence', 'Best practices for customer interaction and service delivery',
 'Learn how to provide exceptional customer service...', '["dispatcher", "driver"]', 'beginner',
 60, TRUE, FALSE, 5),

('Financial Management Basics', 'Understanding invoicing, expenses, and financial reporting',
 'Introduction to financial management in transportation...', '["accountant"]', 'intermediate',
 90, TRUE, TRUE, 5),

('System Security Training', 'Cybersecurity awareness and best practices',
 'Learn about cybersecurity threats and prevention...', '["admin", "it_support"]', 'advanced',
 45, TRUE, TRUE, 5);

-- Insert sample notifications
INSERT INTO notifications (
    user_id, title, message, type, priority, action_url, action_text, created_by
) VALUES
(NULL, 'System Maintenance Scheduled', 'Scheduled maintenance window on Sunday 2AM-4AM EST', 'warning', 'medium',
 '/system/maintenance', 'View Details', 1),

(2, 'New Load Assignment', 'Load LD002 requires dispatcher assignment', 'info', 'high',
 '/loads/LD002', 'Assign Driver', 1),

(3, 'Training Due', 'DOT Safety Regulations training expires in 30 days', 'warning', 'medium',
 '/training/modules/1', 'Start Training', 5),

(4, 'Invoice Overdue', 'Invoice INV001 is past due date', 'error', 'high',
 '/invoices/INV001', 'Send Reminder', 1);

-- Log initial security events for user creation
INSERT INTO security_events (
    user_id, event_type, ip_address, risk_level, details
) VALUES
(1, 'login_success', '127.0.0.1', 'low', '{"action": "initial_setup", "method": "system"}'),
(2, 'login_success', '127.0.0.1', 'low', '{"action": "initial_setup", "method": "system"}'),
(3, 'login_success', '127.0.0.1', 'low', '{"action": "initial_setup", "method": "system"}'),
(4, 'login_success', '127.0.0.1', 'low', '{"action": "initial_setup", "method": "system"}'),
(5, 'login_success', '127.0.0.1', 'low', '{"action": "initial_setup", "method": "system"}');

-- Insert training progress for some users
INSERT INTO training_progress (
    user_id, module_id, status, progress_percentage, started_at
) VALUES
(3, 1, 'in_progress', 65, NOW() - INTERVAL 5 DAY),
(3, 2, 'completed', 100, NOW() - INTERVAL 10 DAY),
(2, 2, 'completed', 100, NOW() - INTERVAL 15 DAY),
(4, 3, 'not_started', 0, NULL),
(5, 4, 'completed', 100, NOW() - INTERVAL 20 DAY);

-- Update training progress completion dates
UPDATE training_progress 
SET completed_at = NOW() - INTERVAL 8 DAY, certificate_issued = TRUE 
WHERE status = 'completed' AND user_id = 3 AND module_id = 2;

UPDATE training_progress 
SET completed_at = NOW() - INTERVAL 12 DAY, certificate_issued = TRUE 
WHERE status = 'completed' AND user_id = 2 AND module_id = 2;

UPDATE training_progress 
SET completed_at = NOW() - INTERVAL 18 DAY, certificate_issued = TRUE 
WHERE status = 'completed' AND user_id = 5 AND module_id = 4;

COMMIT;

-- AOL TMS Database Seeders
-- Test Users and Sample Data for Development and Testing

USE aol_tms;

-- Insert test users (password is 'password123' hashed with bcrypt)
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, is_online, has_training_access, mfa_enabled, last_login) VALUES
('admin@aol.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LhWrDQV7dVjUFd5U6', 'John', 'Administrator', '+1-555-0001', 'admin', TRUE, TRUE, TRUE, FALSE, NOW()),
('dispatcher@aol.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LhWrDQV7dVjUFd5U6', 'Sarah', 'Johnson', '+1-555-0002', 'dispatcher', TRUE, TRUE, TRUE, FALSE, NOW()),
('driver@aol.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LhWrDQV7dVjUFd5U6', 'Mike', 'Williams', '+1-555-0003', 'driver', TRUE, FALSE, FALSE, FALSE, NOW()),
('accountant@aol.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LhWrDQV7dVjUFd5U6', 'Lisa', 'Davis', '+1-555-0004', 'accountant', TRUE, TRUE, TRUE, FALSE, NOW()),
('it@aol.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LhWrDQV7dVjUFd5U6', 'David', 'Chen', '+1-555-0005', 'it_support', TRUE, TRUE, TRUE, TRUE, NOW()),
('driver2@aol.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LhWrDQV7dVjUFd5U6', 'Robert', 'Martinez', '+1-555-0006', 'driver', TRUE, TRUE, TRUE, FALSE, NOW()),
('dispatcher2@aol.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LhWrDQV7dVjUFd5U6', 'Jennifer', 'Wilson', '+1-555-0007', 'dispatcher', TRUE, FALSE, TRUE, FALSE, NOW()),
('driver3@aol.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LhWrDQV7dVjUFd5U6', 'Carlos', 'Rodriguez', '+1-555-0008', 'driver', TRUE, TRUE, FALSE, FALSE, NOW());

-- Insert trucks
INSERT INTO trucks (truck_number, make, model, year, vin, license_plate, status, fuel_capacity, max_weight, current_mileage, last_maintenance_date, next_maintenance_due) VALUES
('T-001', 'Freightliner', 'Cascadia', 2022, '1FUJGLDR6NLAA1234', 'TRK001CA', 'active', 300.00, 80000.00, 125000, '2024-01-01', '2024-04-01'),
('T-002', 'Kenworth', 'T680', 2021, '1XKWD40X5LJ123456', 'TRK002CA', 'active', 280.00, 80000.00, 98000, '2024-01-15', '2024-04-15'),
('T-003', 'Peterbilt', '579', 2023, '1XP5DB9X7ND123789', 'TRK003CA', 'active', 320.00, 80000.00, 45000, '2023-12-20', '2024-03-20'),
('T-004', 'Volvo', 'VNL860', 2020, 'YV1902AKXLA123456', 'TRK004CA', 'maintenance', 300.00, 80000.00, 185000, '2023-11-15', '2024-02-15'),
('T-005', 'Mack', 'Anthem', 2022, '1M1AW07Y5KM123456', 'TRK005CA', 'active', 290.00, 80000.00, 89000, '2024-01-10', '2024-04-10'),
('T-006', 'Freightliner', 'Cascadia', 2023, '1FUJGLDR7NLAA5678', 'TRK006CA', 'active', 300.00, 80000.00, 32000, '2024-01-05', '2024-04-05');

-- Insert customers
INSERT INTO customers (name, company_name, email, phone, address, city, state, zip_code, credit_limit, payment_terms) VALUES
('ABC Logistics', 'ABC Logistics Inc.', 'contact@abclogistics.com', '+1-555-1001', '123 Industrial Blvd', 'Los Angeles', 'CA', '90210', 50000.00, 30),
('XYZ Freight', 'XYZ Freight Solutions', 'billing@xyzfreight.com', '+1-555-1002', '456 Commerce Dr', 'Phoenix', 'AZ', '85001', 75000.00, 15),
('DEF Transport', 'DEF Transport Co.', 'accounts@deftransport.com', '+1-555-1003', '789 Logistics Way', 'Dallas', 'TX', '75201', 100000.00, 30),
('GHI Shipping', 'GHI Shipping Lines', 'payments@ghishipping.com', '+1-555-1004', '321 Harbor St', 'Miami', 'FL', '33101', 60000.00, 45),
('JKL Distribution', 'JKL Distribution Hub', 'finance@jkldist.com', '+1-555-1005', '654 Warehouse Ave', 'Chicago', 'IL', '60601', 80000.00, 30);

-- Insert driver assignments
INSERT INTO driver_assignments (driver_id, truck_id, assigned_date, is_active) VALUES
(3, 1, '2024-01-01', TRUE),  -- Mike Williams -> T-001
(6, 2, '2024-01-01', TRUE),  -- Robert Martinez -> T-002
(8, 3, '2024-01-01', TRUE);  -- Carlos Rodriguez -> T-003

-- Insert sample loads
INSERT INTO loads (load_number, rate_con_number, customer_id, dispatcher_id, driver_id, truck_id, pickup_location, pickup_city, pickup_state, pickup_zip, pickup_date, delivery_location, delivery_city, delivery_state, delivery_zip, delivery_date, commodity, weight, pieces, distance_miles, rate, fuel_surcharge, status) VALUES
('RC-2024-001', 'ABC-RC-2024-001', 1, 2, 3, 1, '123 Industrial Blvd, Los Angeles, CA', 'Los Angeles', 'CA', '90210', '2024-01-16 08:00:00', '456 Distribution Center, Phoenix, AZ', 'Phoenix', 'AZ', '85001', '2024-01-18 14:00:00', 'Electronics', 25000.00, 15, 387.5, 2500.00, 125.00, 'delivered'),
('RC-2024-002', 'XYZ-RC-2024-002', 2, 2, 6, 2, '789 Warehouse, Dallas, TX', 'Dallas', 'TX', '75201', '2024-01-17 06:00:00', '321 Storage Facility, Chicago, IL', 'Chicago', 'IL', '60601', '2024-01-19 16:00:00', 'Automotive Parts', 35000.00, 28, 925.3, 3200.00, 180.00, 'en_route_delivery'),
('RC-2024-003', 'DEF-RC-2024-003', 3, 7, 8, 3, '654 Manufacturing Plant, Miami, FL', 'Miami', 'FL', '33101', '2024-01-18 09:00:00', '987 Distribution Hub, Atlanta, GA', 'Atlanta', 'GA', '30301', '2024-01-20 12:00:00', 'Food Products', 18000.00, 42, 663.2, 1800.00, 90.00, 'assigned'),
('RC-2024-004', 'GHI-RC-2024-004', 4, 2, NULL, NULL, '111 Port Terminal, Miami, FL', 'Miami', 'FL', '33101', '2024-01-20 10:00:00', '222 Import Center, Jacksonville, FL', 'Jacksonville', 'FL', '32201', '2024-01-21 18:00:00', 'Import Goods', 42000.00, 8, 345.8, 2200.00, 110.00, 'pending'),
('RC-2024-005', 'JKL-RC-2024-005', 5, 7, 3, 1, '333 Processing Center, Chicago, IL', 'Chicago', 'IL', '60601', '2024-01-22 07:00:00', '444 Retail Distribution, Denver, CO', 'Denver', 'CO', '80201', '2024-01-24 15:00:00', 'Consumer Goods', 28000.00, 65, 920.1, 2800.00, 140.00, 'pending');

-- Insert load status history
INSERT INTO load_status_history (load_id, status, updated_by, location, notes, timestamp) VALUES
(1, 'assigned', 2, 'Los Angeles, CA', 'Load assigned to Mike Williams', '2024-01-15 10:00:00'),
(1, 'en_route_pickup', 3, 'Los Angeles, CA', 'Driver en route to pickup location', '2024-01-16 07:30:00'),
(1, 'picked_up', 3, 'Los Angeles, CA', 'Load picked up successfully', '2024-01-16 08:45:00'),
(1, 'en_route_delivery', 3, 'Los Angeles, CA', 'En route to Phoenix delivery', '2024-01-16 09:00:00'),
(1, 'delivered', 3, 'Phoenix, AZ', 'Delivered successfully', '2024-01-18 13:30:00'),
(2, 'assigned', 2, 'Dallas, TX', 'Load assigned to Robert Martinez', '2024-01-16 14:00:00'),
(2, 'en_route_pickup', 6, 'Dallas, TX', 'Driver en route to pickup', '2024-01-17 05:30:00'),
(2, 'picked_up', 6, 'Dallas, TX', 'Load secured and ready for transport', '2024-01-17 07:15:00'),
(2, 'en_route_delivery', 6, 'Dallas, TX', 'Heading to Chicago', '2024-01-17 08:00:00'),
(3, 'assigned', 7, 'Miami, FL', 'Load assigned to Carlos Rodriguez', '2024-01-17 16:00:00');

-- Insert sample invoices
INSERT INTO invoices (invoice_number, load_id, customer_id, amount, tax_amount, status, invoice_date, due_date, created_by) VALUES
('INV-2024-001', 1, 1, 2625.00, 210.00, 'paid', '2024-01-18', '2024-02-17', 4),
('INV-2024-002', 2, 2, 3380.00, 270.40, 'sent', '2024-01-19', '2024-02-03', 4),
('INV-2024-003', 3, 3, 1890.00, 151.20, 'draft', '2024-01-20', '2024-02-19', 4);

-- Insert sample expenses
INSERT INTO expenses (load_id, truck_id, driver_id, category, description, amount, vendor, expense_date, location, submitted_by, status) VALUES
(1, 1, 3, 'fuel', 'Diesel fuel purchase in Barstow, CA', 420.50, 'Shell Gas Station', '2024-01-16', 'Barstow, CA', 3, 'approved'),
(1, 1, 3, 'tolls', 'Highway tolls CA to AZ', 45.75, 'Various Toll Authorities', '2024-01-16', 'CA-AZ Route', 3, 'approved'),
(2, 2, 6, 'fuel', 'Fuel stop in Oklahoma City', 395.20, 'Pilot Travel Center', '2024-01-17', 'Oklahoma City, OK', 6, 'pending'),
(NULL, 2, NULL, 'maintenance', 'Oil change and inspection', 180.00, 'Truck Service Center', '2024-01-14', 'Phoenix, AZ', 1, 'approved'),
(2, 2, 6, 'tolls', 'Toll charges through Kansas', 38.50, 'Kansas Turnpike', '2024-01-18', 'Kansas', 6, 'pending');

-- Insert training categories
INSERT INTO training_categories (name, description) VALUES
('Safety', 'Safety regulations and best practices'),
('Operations', 'Operational procedures and protocols'),
('Compliance', 'Regulatory compliance and legal requirements'),
('Maintenance', 'Vehicle maintenance and inspection procedures'),
('Customer Service', 'Customer interaction and service standards');

-- Insert training modules
INSERT INTO training_modules (title, description, category_id, content_type, file_path, duration_minutes, is_mandatory, created_by) VALUES
('DOT Safety Regulations', 'Complete overview of Department of Transportation safety requirements', 1, 'pdf', '/training/dot-safety.pdf', 45, TRUE, 1),
('Vehicle Inspection Training', 'Step-by-step guide for daily vehicle inspections', 4, 'video', '/training/vehicle-inspection.mp4', 30, TRUE, 1),
('Hours of Service Rules', 'Understanding HOS regulations and ELD requirements', 3, 'pdf', '/training/hos-rules.pdf', 25, TRUE, 1),
('Load Securement Guidelines', 'Proper techniques for securing different types of cargo', 2, 'video', '/training/load-securement.mp4', 40, TRUE, 1),
('Customer Communication Best Practices', 'Professional communication with customers and dispatchers', 5, 'pdf', '/training/customer-service.pdf', 20, FALSE, 1),
('Hazmat Transportation', 'Handling and transporting hazardous materials safely', 1, 'video', '/training/hazmat.mp4', 60, FALSE, 1);

-- Insert user training progress
INSERT INTO user_training_progress (user_id, module_id, status, completed_at, score, attempts) VALUES
(3, 1, 'completed', '2024-01-10 14:30:00', 95.00, 1),
(3, 2, 'completed', '2024-01-12 09:15:00', 88.00, 1),
(3, 3, 'in_progress', NULL, NULL, 1),
(6, 1, 'completed', '2024-01-08 16:45:00', 92.00, 1),
(6, 2, 'completed', '2024-01-11 11:20:00', 90.00, 1),
(6, 3, 'completed', '2024-01-14 13:10:00', 87.00, 1),
(6, 4, 'in_progress', NULL, NULL, 1),
(8, 1, 'not_started', NULL, NULL, 0),
(8, 2, 'not_started', NULL, NULL, 0);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, data_type, description, is_public) VALUES
('company_name', 'All Over Logistics', 'string', 'Company name', TRUE),
('company_phone', '+1-555-AOL-TMS', 'string', 'Company phone number', TRUE),
('company_email', 'info@aol-tms.com', 'string', 'Company email address', TRUE),
('default_fuel_rate', '3.85', 'decimal', 'Default fuel rate per gallon', FALSE),
('invoice_due_days', '30', 'integer', 'Default invoice due days', FALSE),
('max_login_attempts', '5', 'integer', 'Maximum login attempts before lockout', FALSE),
('session_timeout_minutes', '480', 'integer', 'User session timeout in minutes', FALSE),
('encryption_key_rotation_days', '30', 'integer', 'Days between encryption key rotations', FALSE);

-- Insert encryption keys (simplified for demo)
INSERT INTO encryption_keys (key_name, key_value, algorithm, is_active, expires_at, rotation_count) VALUES
('primary_data_key', 'demo_key_for_development_only', 'AES-256', TRUE, DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('backup_data_key', 'demo_backup_key_for_development', 'AES-256', FALSE, DATE_ADD(NOW(), INTERVAL 60 DAY), 0);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, category, is_read) VALUES
(3, 'New Trip Assigned', 'You have been assigned to load RC-2024-005. Pickup scheduled for Jan 22.', 'info', 'load', FALSE),
(3, 'Training Module Due', 'Please complete the Hours of Service Rules training module.', 'warning', 'training', FALSE),
(6, 'Payment Processed', 'Your payment for load RC-2024-001 has been processed: $2,625.00', 'success', 'payment', TRUE),
(2, 'Truck Maintenance Alert', 'Truck T-004 is due for maintenance. Please schedule service.', 'warning', 'maintenance', FALSE),
(1, 'System Backup Complete', 'Daily system backup completed successfully.', 'success', 'system', TRUE);

-- Insert security events
INSERT INTO security_events (user_id, event_type, ip_address, user_agent, risk_level, timestamp) VALUES
(1, 'login_success', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'low', NOW()),
(2, 'login_success', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'low', NOW()),
(NULL, 'login_failed', '192.168.1.250', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 'medium', DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(5, 'mfa_setup', '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'low', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- Insert system logs
INSERT INTO system_logs (user_id, action, entity_type, entity_id, ip_address, severity, timestamp) VALUES
(2, 'load_created', 'loads', 5, '192.168.1.101', 'info', NOW()),
(3, 'status_updated', 'loads', 2, '192.168.1.103', 'info', NOW()),
(4, 'invoice_generated', 'invoices', 3, '192.168.1.104', 'info', NOW()),
(1, 'user_created', 'users', 8, '192.168.1.100', 'info', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert performance metrics
INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, entity_type, entity_id, recorded_at) VALUES
('fuel_efficiency', 6.8, 'mpg', 'trucks', 1, NOW()),
('fuel_efficiency', 7.2, 'mpg', 'trucks', 2, NOW()),
('fuel_efficiency', 6.5, 'mpg', 'trucks', 3, NOW()),
('on_time_delivery_rate', 94.2, 'percentage', 'drivers', 3, NOW()),
('on_time_delivery_rate', 96.8, 'percentage', 'drivers', 6, NOW()),
('load_completion_time', 2.3, 'days', 'loads', 1, NOW()),
('load_completion_time', 2.8, 'days', 'loads', 2, NOW());

-- Create admin user with full privileges
UPDATE users SET has_training_access = TRUE WHERE role = 'admin';

-- Grant training access to specific users
UPDATE users SET has_training_access = TRUE WHERE id IN (2, 4, 6); -- Dispatcher, Accountant, Driver2

COMMIT;

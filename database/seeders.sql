-- AOL TMS Enterprise Database Seeders
-- Version: 2.0.0
-- Test data for development and demonstration
-- All passwords are bcrypt hashed version of 'admin123'

SET foreign_key_checks = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- Clear existing data
DELETE FROM training_progress;
DELETE FROM training_modules;
DELETE FROM chat_messages;
DELETE FROM chat_rooms;
DELETE FROM expense_receipts;
DELETE FROM expenses;
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM load_documents;
DELETE FROM load_status_history;
DELETE FROM loads;
DELETE FROM broker_payments;
DELETE FROM brokers;
DELETE FROM trucks;
DELETE FROM role_permissions;
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM roles;
DELETE FROM permissions;
DELETE FROM user_sessions;
DELETE FROM security_events;

-- =============================================
-- PERMISSIONS AND ROLES SETUP
-- =============================================

-- Insert permissions
INSERT INTO permissions (name, description, module, action) VALUES
-- User management permissions
('user.view', 'View user profiles and information', 'user', 'view'),
('user.create', 'Create new user accounts', 'user', 'create'),
('user.update', 'Update user profiles and settings', 'user', 'update'),
('user.delete', 'Delete user accounts', 'user', 'delete'),
('user.assign_roles', 'Assign roles to users', 'user', 'assign_roles'),
('user.reset_password', 'Reset user passwords', 'user', 'reset_password'),
('user.toggle_mfa', 'Enable/disable MFA for users', 'user', 'toggle_mfa'),

-- Load management permissions
('load.view', 'View load information', 'load', 'view'),
('load.create', 'Create new loads', 'load', 'create'),
('load.update', 'Update load information', 'load', 'update'),
('load.delete', 'Delete loads', 'load', 'delete'),
('load.assign', 'Assign drivers and trucks to loads', 'load', 'assign'),
('load.status_update', 'Update load status', 'load', 'status_update'),

-- Document management permissions
('document.view', 'View documents', 'document', 'view'),
('document.upload', 'Upload documents', 'document', 'upload'),
('document.delete', 'Delete documents', 'document', 'delete'),
('document.verify', 'Verify document authenticity', 'document', 'verify'),

-- Financial permissions
('invoice.view', 'View invoices', 'invoice', 'view'),
('invoice.create', 'Create invoices', 'invoice', 'create'),
('invoice.send', 'Send invoices to brokers', 'invoice', 'send'),
('invoice.payment_update', 'Update payment status', 'invoice', 'payment_update'),

-- Expense permissions
('expense.view', 'View expenses', 'expense', 'view'),
('expense.create', 'Create expense records', 'expense', 'create'),
('expense.approve', 'Approve expenses', 'expense', 'approve'),
('expense.reimburse', 'Process reimbursements', 'expense', 'reimburse'),

-- Broker management permissions
('broker.view', 'View broker information', 'broker', 'view'),
('broker.create', 'Create new broker records', 'broker', 'create'),
('broker.update', 'Update broker information', 'broker', 'update'),
('broker.credit_update', 'Update broker credit status', 'broker', 'credit_update'),

-- Truck management permissions
('truck.view', 'View truck information', 'truck', 'view'),
('truck.create', 'Create truck records', 'truck', 'create'),
('truck.update', 'Update truck information', 'truck', 'update'),
('truck.maintenance', 'Manage truck maintenance', 'truck', 'maintenance'),

-- Training permissions
('training.view', 'View training modules', 'training', 'view'),
('training.create', 'Create training modules', 'training', 'create'),
('training.assign', 'Assign training to users', 'training', 'assign'),
('training.progress', 'View training progress', 'training', 'progress'),

-- Communication permissions
('chat.view', 'View chat messages', 'chat', 'view'),
('chat.send', 'Send chat messages', 'chat', 'send'),
('chat.moderate', 'Moderate chat rooms', 'chat', 'moderate'),

-- System permissions
('system.logs', 'View system logs', 'system', 'logs'),
('system.security', 'View security events', 'system', 'security'),
('system.settings', 'Manage system settings', 'system', 'settings'),
('system.backup', 'Perform system backups', 'system', 'backup');

-- Insert roles
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Administrator', 'Complete system access with all permissions'),
('dispatcher', 'Dispatcher', 'Load management, driver coordination, and documentation'),
('driver', 'Driver', 'Mobile app access, trip management, and document upload'),
('accountant', 'Accountant', 'Financial management, invoicing, and expense tracking'),
('it_support', 'IT Support', 'System monitoring, security logs, and technical maintenance');

-- =============================================
-- ROLE PERMISSIONS ASSIGNMENT
-- =============================================

-- Admin role gets all permissions
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 
    (SELECT id FROM roles WHERE name = 'admin'),
    p.id,
    1 -- System assignment
FROM permissions p;

-- Dispatcher role permissions
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 
    (SELECT id FROM roles WHERE name = 'dispatcher'),
    p.id,
    1
FROM permissions p
WHERE p.name IN (
    'user.view', 'load.view', 'load.create', 'load.update', 'load.assign', 'load.status_update',
    'document.view', 'document.upload', 'document.verify', 'broker.view', 'broker.update',
    'truck.view', 'chat.view', 'chat.send', 'expense.view'
);

-- Driver role permissions
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 
    (SELECT id FROM roles WHERE name = 'driver'),
    p.id,
    1
FROM permissions p
WHERE p.name IN (
    'load.view', 'load.status_update', 'document.view', 'document.upload',
    'expense.view', 'expense.create', 'chat.view', 'chat.send', 'training.view'
);

-- Accountant role permissions
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 
    (SELECT id FROM roles WHERE name = 'accountant'),
    p.id,
    1
FROM permissions p
WHERE p.name IN (
    'load.view', 'invoice.view', 'invoice.create', 'invoice.send', 'invoice.payment_update',
    'expense.view', 'expense.approve', 'expense.reimburse', 'broker.view', 'broker.credit_update',
    'document.view', 'chat.view', 'chat.send'
);

-- IT Support role permissions
INSERT INTO role_permissions (role_id, permission_id, granted_by)
SELECT 
    (SELECT id FROM roles WHERE name = 'it_support'),
    p.id,
    1
FROM permissions p
WHERE p.name IN (
    'user.view', 'user.reset_password', 'user.toggle_mfa', 'system.logs', 'system.security',
    'system.settings', 'system.backup', 'chat.moderate'
);

-- =============================================
-- USERS SETUP
-- =============================================

-- Insert users with bcrypt hashed passwords (password: admin123)
INSERT INTO users (
    email, password, first_name, last_name, phone, 
    mfa_enabled, is_active, email_verified_at, 
    has_training_access, training_level, timezone
) VALUES
-- Admin user
('admin@alloverlogistics.com', '$2b$12$LQv3c1yqBwlVHpPjrF.Uu.5wkcZHA2bp.vgOH/A9s7FKLhFe6s.qS', 'System', 'Administrator', '+1-555-0101', FALSE, TRUE, NOW(), TRUE, 'advanced', 'America/New_York'),

-- Dispatcher users
('dispatcher@alloverlogistics.com', '$2b$12$LQv3c1yqBwlVHpPjrF.Uu.5wkcZHA2bp.vgOH/A9s7FKLhFe6s.qS', 'Sarah', 'Johnson', '+1-555-0102', FALSE, TRUE, NOW(), TRUE, 'intermediate', 'America/New_York'),
('dispatcher2@alloverlogistics.com', '$2b$12$LQv3c1yqBwlVHpPjrF.Uu.5wkcZHA2bp.vgOH/A9s7FKLhFe6s.qS', 'Mike', 'Rodriguez', '+1-555-0103', FALSE, TRUE, NOW(), TRUE, 'intermediate', 'America/Chicago'),

-- Driver users
('driver@alloverlogistics.com', '$2b$12$LQv3c1yqBwlVHpPjrF.Uu.5wkcZHA2bp.vgOH/A9s7FKLhFe6s.qS', 'John', 'Smith', '+1-555-0201', FALSE, TRUE, NOW(), TRUE, 'basic', 'America/New_York'),
('driver2@alloverlogistics.com', '$2b$12$LQv3c1yqBwlVHpPjrF.Uu.5wkcZHA2bp.vgOH/A9s7FKLhFe6s.qS', 'David', 'Williams', '+1-555-0202', FALSE, TRUE, NOW(), TRUE, 'basic', 'America/Los_Angeles'),
('driver3@alloverlogistics.com', '$2b$12$LQv3c1yqBwlVHpPjrF.Uu.5wkcZHA2bp.vgOH/A9s7FKLhFe6s.qS', 'Carlos', 'Martinez', '+1-555-0203', FALSE, TRUE, NOW(), FALSE, 'basic', 'America/Denver'),
('driver4@alloverlogistics.com', '$2b$12$LQv3c1yqBwlVHpPjrF.Uu.5wkcZHA2bp.vgOH/A9s7FKLhFe6s.qS', 'Robert', 'Davis', '+1-555-0204', FALSE, TRUE, NOW(), TRUE, 'intermediate', 'America/Chicago'),

-- Accountant users
('accountant@alloverlogistics.com', '$2b$12$LQv3c1yqBwlVHpPjrF.Uu.5wkcZHA2bp.vgOH/A9s7FKLhFe6s.qS', 'Lisa', 'Thompson', '+1-555-0301', FALSE, TRUE, NOW(), FALSE, 'intermediate', 'America/New_York'),
('accountant2@alloverlogistics.com', '$2b$12$LQv3c1yqBwlVHpPjrF.Uu.5wkcZHA2bp.vgOH/A9s7FKLhFe6s.qS', 'Jennifer', 'Wilson', '+1-555-0302', FALSE, TRUE, NOW(), FALSE, 'basic', 'America/New_York'),

-- IT Support users
('it@alloverlogistics.com', '$2b$12$LQv3c1yqBwlVHpPjrF.Uu.5wkcZHA2bp.vgOH/A9s7FKLhFe6s.qS', 'Alex', 'Chen', '+1-555-0401', TRUE, TRUE, NOW(), FALSE, 'advanced', 'America/New_York'),
('it2@alloverlogistics.com', '$2b$12$LQv3c1yqBwlVHpPjrF.Uu.5wkcZHA2bp.vgOH/A9s7FKLhFe6s.qS', 'Maria', 'Garcia', '+1-555-0402', FALSE, TRUE, NOW(), FALSE, 'intermediate', 'America/Los_Angeles');

-- =============================================
-- USER ROLE ASSIGNMENTS
-- =============================================

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at) VALUES
-- Admin role
(1, (SELECT id FROM roles WHERE name = 'admin'), 1, NOW()),

-- Dispatcher roles
(2, (SELECT id FROM roles WHERE name = 'dispatcher'), 1, NOW()),
(3, (SELECT id FROM roles WHERE name = 'dispatcher'), 1, NOW()),

-- Driver roles
(4, (SELECT id FROM roles WHERE name = 'driver'), 1, NOW()),
(5, (SELECT id FROM roles WHERE name = 'driver'), 1, NOW()),
(6, (SELECT id FROM roles WHERE name = 'driver'), 1, NOW()),
(7, (SELECT id FROM roles WHERE name = 'driver'), 1, NOW()),

-- Accountant roles
(8, (SELECT id FROM roles WHERE name = 'accountant'), 1, NOW()),
(9, (SELECT id FROM roles WHERE name = 'accountant'), 1, NOW()),

-- IT Support roles
(10, (SELECT id FROM roles WHERE name = 'it_support'), 1, NOW()),
(11, (SELECT id FROM roles WHERE name = 'it_support'), 1, NOW());

-- =============================================
-- TRUCKS SETUP
-- =============================================

INSERT INTO trucks (
    truck_number, vin, make, model, year, color,
    gross_weight, max_payload, fuel_type, status,
    assigned_driver_id, insurance_policy, insurance_expires_at,
    registration_expires_at, dot_inspection_due,
    last_maintenance_date, next_maintenance_due
) VALUES
('AOL001', '1HGBH41JXMN109186', 'Freightliner', 'Cascadia', 2022, 'White', 80000, 34000, 'diesel', 'active', 4, 'POL-2024-001', '2024-12-31', '2024-11-30', '2024-10-15', '2024-08-15', '2024-11-15'),
('AOL002', '1HGBH41JXMN109187', 'Peterbilt', '579', 2021, 'Blue', 80000, 34000, 'diesel', 'active', 5, 'POL-2024-002', '2024-12-31', '2024-11-30', '2024-09-20', '2024-07-20', '2024-10-20'),
('AOL003', '1HGBH41JXMN109188', 'Kenworth', 'T680', 2023, 'Red', 80000, 34000, 'diesel', 'active', 6, 'POL-2024-003', '2024-12-31', '2024-11-30', '2024-11-10', '2024-09-10', '2024-12-10'),
('AOL004', '1HGBH41JXMN109189', 'Volvo', 'VNL', 2022, 'Black', 80000, 34000, 'diesel', 'active', 7, 'POL-2024-004', '2024-12-31', '2024-11-30', '2024-10-05', '2024-08-05', '2024-11-05'),
('AOL005', '1HGBH41JXMN109190', 'Mack', 'Anthem', 2021, 'Green', 80000, 34000, 'diesel', 'maintenance', NULL, 'POL-2024-005', '2024-12-31', '2024-11-30', '2024-09-15', '2024-09-01', '2024-10-01');

-- =============================================
-- BROKERS SETUP
-- =============================================

INSERT INTO brokers (
    company_name, contact_name, email, phone,
    address_line1, city, state, zip_code,
    mc_number, dot_number, credit_status, credit_limit,
    payment_terms, preferred_payment_method,
    average_payment_days, total_loads_completed, total_revenue, rating
) VALUES
('Express Logistics LLC', 'Tom Anderson', 'tom.anderson@expresslogistics.com', '+1-555-1001', '123 Business Park Dr', 'Atlanta', 'GA', '30309', 'MC-123456', 'DOT-789123', 'approved', 50000.00, 'quick_pay', 'quick_pay', 2.5, 45, 125000.00, 4.5),
('National Freight Solutions', 'Rebecca Miller', 'rebecca@nationalfreight.com', '+1-555-1002', '456 Industrial Ave', 'Chicago', 'IL', '60614', 'MC-234567', 'DOT-890234', 'approved', 75000.00, 'net_30', 'ach', 28.3, 67, 189000.00, 4.2),
('Sunrise Transport Group', 'Michael Davis', 'mdavis@sunrisetransport.com', '+1-555-1003', '789 Commerce Blvd', 'Phoenix', 'AZ', '85001', 'MC-345678', 'DOT-901345', 'approved', 60000.00, 'net_15', 'ach', 14.8, 23, 67500.00, 4.8),
('Premier Shipping Co', 'Sarah Wilson', 'sarah.wilson@premiershipping.com', '+1-555-1004', '321 Trade Center', 'Houston', 'TX', '77002', 'MC-456789', 'DOT-012456', 'pending', 25000.00, 'net_30', 'check', 0.0, 0, 0.00, 0.0),
('Quick Cargo Services', 'James Brown', 'jbrown@quickcargo.com', '+1-555-1005', '654 Logistics Way', 'Memphis', 'TN', '38101', 'MC-567890', 'DOT-123567', 'denied', 0.00, 'cod', 'zelle', 0.0, 8, 15000.00, 2.1),
('Reliable Routes Inc', 'Linda Garcia', 'linda@reliableroutes.com', '+1-555-1006', '987 Freight Ave', 'Los Angeles', 'CA', '90001', 'MC-678901', 'DOT-234678', 'approved', 40000.00, 'quick_pay', 'quick_pay', 1.2, 134, 287000.00, 4.7);

-- =============================================
-- LOADS SETUP
-- =============================================

INSERT INTO loads (
    load_number, broker_id, driver_id, truck_id, commodity, weight, pieces,
    pickup_company, pickup_address_line1, pickup_city, pickup_state, pickup_zip,
    pickup_contact_name, pickup_contact_phone, pickup_date, pickup_time_start, pickup_time_end,
    delivery_company, delivery_address_line1, delivery_city, delivery_state, delivery_zip,
    delivery_contact_name, delivery_contact_phone, delivery_date, delivery_time_start, delivery_time_end,
    total_miles, total_amount, fuel_surcharge, status, priority, created_by
) VALUES
-- Active loads
('AOL-2024-001', 1, 4, 1, 'Electronics - Consumer Goods', 15000.00, 250, 
 'TechWorld Manufacturing', '1500 Tech Drive', 'San Jose', 'CA', '95112',
 'Bob Tech', '+1-408-555-0100', '2024-12-20', '08:00:00', '16:00:00',
 'Electronics Plus Warehouse', '2400 Distribution Center', 'Dallas', 'TX', '75201',
 'Maria Warehouse', '+1-214-555-0200', '2024-12-22', '06:00:00', '18:00:00',
 1287.5, 3875.00, 187.50, 'assigned', 'normal', 2),

('AOL-2024-002', 2, 5, 2, 'Auto Parts', 22000.00, 150,
 'AutoParts Supplier Inc', '800 Industrial Blvd', 'Detroit', 'MI', '48201',
 'Steve Parts', '+1-313-555-0101', '2024-12-21', '07:00:00', '15:00:00',
 'CarMax Distribution', '3300 Auto Center Dr', 'Phoenix', 'AZ', '85003',
 'Jennifer Auto', '+1-602-555-0202', '2024-12-23', '08:00:00', '17:00:00',
 1156.2, 4250.00, 198.75, 'en_route_pickup', 'high', 2),

('AOL-2024-003', 3, 6, 3, 'Furniture - Office Equipment', 18500.00, 85,
 'Office Solutions Corp', '450 Business Plaza', 'Charlotte', 'NC', '28202',
 'Paul Office', '+1-704-555-0103', '2024-12-19', '09:00:00', '17:00:00',
 'Corporate Furnishings', '1800 Executive Way', 'Miami', 'FL', '33101',
 'Angela Corporate', '+1-305-555-0203', '2024-12-21', '10:00:00', '16:00:00',
 647.8, 2925.00, 145.50, 'delivered', 'normal', 2),

-- Completed loads
('AOL-2024-004', 1, 7, 4, 'Food Products - Frozen', 25000.00, 500,
 'FreshFoods Processing', '200 Cold Storage Rd', 'Green Bay', 'WI', '54302',
 'Mike Fresh', '+1-920-555-0104', '2024-12-15', '06:00:00', '14:00:00',
 'Grocery Chain Distribution', '5000 Food Court Ave', 'Atlanta', 'GA', '30309',
 'Sarah Grocery', '+1-404-555-0204', '2024-12-17', '05:00:00', '15:00:00',
 923.4, 3650.00, 175.25, 'paid', 'urgent', 2),

('AOL-2024-005', 6, 4, 1, 'Construction Materials', 30000.00, 75,
 'BuildRight Supply', '1200 Construction Ave', 'Denver', 'CO', '80202',
 'Tom Build', '+1-303-555-0105', '2024-12-10', '08:00:00', '16:00:00',
 'MegaConstruction Site', '3500 Development Blvd', 'Las Vegas', 'NV', '89101',
 'Lisa Mega', '+1-702-555-0205', '2024-12-12', '07:00:00', '17:00:00',
 756.3, 4125.00, 189.75, 'invoiced', 'high', 3);

-- =============================================
-- LOAD STATUS HISTORY
-- =============================================

INSERT INTO load_status_history (load_id, previous_status, new_status, changed_by, occurred_at) VALUES
(1, 'created', 'assigned', 2, '2024-12-18 10:30:00'),
(2, 'created', 'assigned', 2, '2024-12-19 09:15:00'),
(2, 'assigned', 'en_route_pickup', 5, '2024-12-21 07:30:00'),
(3, 'created', 'assigned', 2, '2024-12-17 14:20:00'),
(3, 'assigned', 'en_route_pickup', 6, '2024-12-19 09:00:00'),
(3, 'en_route_pickup', 'loaded', 6, '2024-12-19 16:45:00'),
(3, 'loaded', 'delivered', 6, '2024-12-21 15:30:00'),
(4, 'created', 'assigned', 2, '2024-12-13 11:00:00'),
(4, 'assigned', 'delivered', 7, '2024-12-17 14:00:00'),
(4, 'delivered', 'invoiced', 8, '2024-12-18 10:00:00'),
(4, 'invoiced', 'paid', 8, '2024-12-20 16:30:00'),
(5, 'created', 'assigned', 3, '2024-12-08 13:45:00'),
(5, 'assigned', 'delivered', 4, '2024-12-12 16:00:00'),
(5, 'delivered', 'invoiced', 8, '2024-12-13 09:30:00');

-- =============================================
-- INVOICES SETUP
-- =============================================

INSERT INTO invoices (
    invoice_number, load_id, broker_id, invoice_date, due_date,
    subtotal, tax_amount, total_amount, payment_status, status, created_by
) VALUES
('INV-2024-001', 4, 1, '2024-12-18', '2024-12-20', 3650.00, 0.00, 3650.00, 'paid', 'paid', 8),
('INV-2024-002', 5, 6, '2024-12-13', '2024-12-14', 4125.00, 0.00, 4125.00, 'unpaid', 'sent', 8),
('INV-2024-003', 3, 3, '2024-12-22', '2024-12-29', 2925.00, 0.00, 2925.00, 'unpaid', 'draft', 8);

-- =============================================
-- INVOICE ITEMS
-- =============================================

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, item_type) VALUES
-- Invoice 1 items
(1, 'Freight - Food Products Transport', 1.00, 3474.75, 'freight'),
(1, 'Fuel Surcharge', 1.00, 175.25, 'fuel_surcharge'),

-- Invoice 2 items
(2, 'Freight - Construction Materials', 1.00, 3935.25, 'freight'),
(2, 'Fuel Surcharge', 1.00, 189.75, 'fuel_surcharge'),

-- Invoice 3 items
(3, 'Freight - Office Equipment', 1.00, 2779.50, 'freight'),
(3, 'Fuel Surcharge', 1.00, 145.50, 'fuel_surcharge');

-- =============================================
-- EXPENSES SETUP
-- =============================================

INSERT INTO expenses (
    load_id, truck_id, driver_id, expense_type, description, amount,
    vendor_name, transaction_date, payment_method, approval_status, submitted_by
) VALUES
-- Fuel expenses
(1, 1, 4, 'fuel', 'Fuel - San Jose to Bakersfield', 185.50, 'Shell Station #1234', '2024-12-20', 'fuel_card', 'approved', 4),
(1, 1, 4, 'fuel', 'Fuel - Bakersfield to Dallas', 220.75, 'Chevron Travel Center', '2024-12-21', 'fuel_card', 'approved', 4),
(2, 2, 5, 'fuel', 'Fuel - Detroit start', 195.25, 'BP Station', '2024-12-21', 'fuel_card', 'approved', 5),
(4, 4, 7, 'fuel', 'Fuel - Green Bay to Chicago', 165.00, 'Flying J', '2024-12-15', 'fuel_card', 'approved', 7),
(4, 4, 7, 'fuel', 'Fuel - Chicago to Atlanta', 198.50, 'Pilot Travel Center', '2024-12-16', 'fuel_card', 'approved', 7),

-- Meal expenses
(1, 1, 4, 'meals', 'Lunch and dinner', 42.50, 'Truck Stop Diner', '2024-12-20', 'credit_card', 'approved', 4),
(2, 2, 5, 'meals', 'Meals during trip', 38.75, 'Highway Restaurant', '2024-12-21', 'cash', 'pending', 5),
(4, 4, 7, 'meals', 'Meals for 2-day trip', 67.25, 'Various Restaurants', '2024-12-16', 'credit_card', 'approved', 7),

-- Toll expenses
(1, 1, 4, 'tolls', 'Highway tolls - CA to TX', 35.50, 'State Highway Authority', '2024-12-21', 'cash', 'approved', 4),
(4, 4, 7, 'tolls', 'Toll roads - WI to GA', 28.75, 'E-ZPass', '2024-12-16', 'company_card', 'approved', 7),

-- Maintenance expenses
(3, 3, 6, 'maintenance', 'Oil change and inspection', 145.00, 'Truck Service Pro', '2024-12-19', 'company_card', 'approved', 6),
(5, 1, 4, 'repairs', 'Tire replacement - road damage', 285.75, 'Roadside Tire Service', '2024-12-11', 'company_card', 'approved', 4);

-- =============================================
-- TRAINING MODULES SETUP
-- =============================================

INSERT INTO training_modules (
    title, description, content_type, is_mandatory, passing_score,
    minimum_level, is_active, published_at, created_by
) VALUES
('DOT Safety Regulations', 'Comprehensive training on Department of Transportation safety regulations and compliance requirements for commercial drivers.', 'interactive', TRUE, 85.00, 'basic', TRUE, NOW(), 1),
('Hours of Service Rules', 'Understanding federal hours of service regulations, logbook requirements, and electronic logging device (ELD) usage.', 'video', TRUE, 80.00, 'basic', TRUE, NOW(), 1),
('Hazmat Transportation Basics', 'Basic training for transporting hazardous materials, including classification, documentation, and safety procedures.', 'interactive', FALSE, 90.00, 'intermediate', TRUE, NOW(), 1),
('Defensive Driving Techniques', 'Advanced defensive driving techniques for commercial vehicle operators to prevent accidents and improve safety.', 'video', TRUE, 75.00, 'basic', TRUE, NOW(), 1),
('Customer Service Excellence', 'Professional communication and customer service skills for driver interactions with customers and brokers.', 'document', FALSE, 70.00, 'basic', TRUE, NOW(), 1),
('Load Securement Standards', 'Proper load securement techniques and equipment usage according to FMCSA regulations.', 'interactive', TRUE, 85.00, 'basic', TRUE, NOW(), 1),
('Emergency Response Procedures', 'Emergency response procedures for accidents, breakdowns, and hazardous situations on the road.', 'video', TRUE, 80.00, 'intermediate', TRUE, NOW(), 1),
('Financial Management for O/O', 'Financial planning and management strategies for owner-operators, including tax planning and expense tracking.', 'document', FALSE, 75.00, 'advanced', TRUE, NOW(), 1);

-- =============================================
-- TRAINING PROGRESS
-- =============================================

INSERT INTO training_progress (
    user_id, module_id, status, progress_percentage, started_at, completed_at,
    score, passing_score, attempts_count, passed, assigned_by
) VALUES
-- Driver 1 (John Smith) - Active training
(4, 1, 'completed', 100.00, '2024-12-01 09:00:00', '2024-12-01 11:30:00', 92.5, 85.00, 1, TRUE, 1),
(4, 2, 'completed', 100.00, '2024-12-02 10:00:00', '2024-12-02 12:15:00', 88.0, 80.00, 1, TRUE, 1),
(4, 4, 'in_progress', 65.00, '2024-12-18 14:00:00', NULL, NULL, 75.00, 1, FALSE, 1),
(4, 6, 'not_started', 0.00, NULL, NULL, NULL, 85.00, 0, FALSE, 1),

-- Driver 2 (David Williams) - Some completed
(5, 1, 'completed', 100.00, '2024-11-15 08:30:00', '2024-11-15 11:00:00', 89.5, 85.00, 1, TRUE, 1),
(5, 2, 'failed', 100.00, '2024-11-20 09:00:00', '2024-11-20 11:30:00', 72.0, 80.00, 2, FALSE, 1),
(5, 4, 'completed', 100.00, '2024-12-05 13:00:00', '2024-12-05 15:45:00', 81.5, 75.00, 1, TRUE, 1),

-- Driver 4 (Robert Davis) - Advanced level
(7, 1, 'completed', 100.00, '2024-10-01 10:00:00', '2024-10-01 12:30:00', 95.0, 85.00, 1, TRUE, 1),
(7, 2, 'completed', 100.00, '2024-10-05 09:00:00', '2024-10-05 11:15:00', 91.5, 80.00, 1, TRUE, 1),
(7, 3, 'completed', 100.00, '2024-11-10 08:00:00', '2024-11-10 12:00:00', 94.0, 90.00, 1, TRUE, 1),
(7, 4, 'completed', 100.00, '2024-11-15 14:00:00', '2024-11-15 16:30:00', 87.5, 75.00, 1, TRUE, 1),
(7, 6, 'completed', 100.00, '2024-12-01 10:00:00', '2024-12-01 13:00:00', 90.0, 85.00, 1, TRUE, 1),
(7, 7, 'in_progress', 45.00, '2024-12-15 09:00:00', NULL, NULL, 80.00, 1, FALSE, 1);

-- =============================================
-- CHAT ROOMS SETUP
-- =============================================

INSERT INTO chat_rooms (
    name, description, room_type, allowed_roles, is_public, created_by
) VALUES
('General Discussion', 'Main chat room for general company communication', 'general', '["admin", "dispatcher", "driver", "accountant", "it_support"]', TRUE, 1),
('Dispatch Center', 'Communication channel for dispatchers and drivers', 'general', '["admin", "dispatcher", "driver"]', FALSE, 2),
('IT Support', 'Technical support and system issues', 'support', '["admin", "it_support"]', FALSE, 10),
('Driver Lounge', 'Casual chat space for drivers', 'general', '["driver"]', TRUE, 4),
('Management', 'Management and administration discussions', 'general', '["admin", "accountant"]', FALSE, 1);

-- Load-specific chat rooms
INSERT INTO chat_rooms (
    name, description, room_type, load_id, allowed_roles, is_public, created_by
) VALUES
('Load AOL-2024-001', 'Communication for load AOL-2024-001', 'load_specific', 1, '["admin", "dispatcher", "driver"]', FALSE, 2),
('Load AOL-2024-002', 'Communication for load AOL-2024-002', 'load_specific', 2, '["admin", "dispatcher", "driver"]', FALSE, 2);

-- =============================================
-- CHAT MESSAGES SETUP
-- =============================================

INSERT INTO chat_messages (
    room_id, user_id, message_type, content, priority, created_at
) VALUES
-- General Discussion messages
(1, 2, 'text', 'Good morning everyone! Weather looks clear for today\'s routes.', 'normal', '2024-12-20 08:00:00'),
(1, 4, 'text', 'Morning Sarah! Ready to roll on AOL-001.', 'normal', '2024-12-20 08:05:00'),
(1, 1, 'text', 'Team, remember to update load statuses in real-time today. Thanks!', 'high', '2024-12-20 08:15:00'),
(1, 5, 'text', 'Copy that! En route to pickup location now.', 'normal', '2024-12-20 08:30:00'),

-- Dispatch Center messages
(2, 2, 'text', 'John, your pickup time has been confirmed for 8:00 AM. BOL ready at shipper.', 'high', '2024-12-20 07:45:00'),
(2, 4, 'text', 'Received. ETA at pickup 7:50 AM. Will call when loaded.', 'normal', '2024-12-20 07:47:00'),
(2, 2, 'text', 'Perfect. Safe travels!', 'normal', '2024-12-20 07:48:00'),
(2, 5, 'text', 'Dispatcher, need updated delivery address for AOL-002', 'high', '2024-12-21 10:15:00'),
(2, 2, 'text', 'Checking with broker now. Will update you in 10 minutes.', 'normal', '2024-12-21 10:16:00'),

-- Load-specific messages
(6, 2, 'text', 'Load AOL-2024-001 assigned to John. Electronics pickup confirmed.', 'normal', '2024-12-18 10:35:00'),
(6, 4, 'text', 'Thanks! Reviewing route and will be ready tomorrow morning.', 'normal', '2024-12-18 10:40:00'),
(7, 2, 'text', 'Load AOL-2024-002 ready for pickup. Auto parts - handle with care.', 'normal', '2024-12-19 09:20:00'),
(7, 5, 'text', 'Understood. Will inspect load carefully during pickup.', 'normal', '2024-12-19 09:25:00');

-- =============================================
-- SECURITY EVENTS (SAMPLE)
-- =============================================

INSERT INTO security_events (
    user_id, event_type, severity, description, ip_address, created_at
) VALUES
(1, 'login', 'low', 'Successful admin login', '192.168.1.100', '2024-12-20 08:00:00'),
(2, 'login', 'low', 'Successful dispatcher login', '192.168.1.101', '2024-12-20 07:30:00'),
(4, 'login', 'low', 'Successful driver login via mobile', '10.0.0.50', '2024-12-20 07:45:00'),
(5, 'login', 'low', 'Successful driver login via mobile', '10.0.0.51', '2024-12-21 07:30:00'),
(12, 'failed_login', 'medium', 'Failed login attempt - invalid password', '203.0.113.1', '2024-12-19 14:30:00'),
(1, 'permission_changed', 'medium', 'User role modified - added admin privileges', '192.168.1.100', '2024-12-18 16:00:00'),
(10, 'mfa_enabled', 'low', 'Multi-factor authentication enabled', '192.168.1.110', '2024-12-15 11:00:00');

-- =============================================
-- BROKER PAYMENTS
-- =============================================

INSERT INTO broker_payments (
    broker_id, load_id, amount, payment_method, reference_number,
    expected_date, received_date, payment_status, processed_by
) VALUES
(1, 4, 3650.00, 'quick_pay', 'QP-2024-1201', '2024-12-20', '2024-12-20', 'received', 8),
(6, 5, 4125.00, 'ach', 'ACH-REF-789456', '2024-12-28', NULL, 'pending', 8),
(3, 3, 2925.00, 'ach', NULL, '2025-01-07', NULL, 'pending', 8);

SET foreign_key_checks = 1;

-- Update statistics
ANALYZE TABLE users, roles, permissions, loads, brokers, trucks, expenses, invoices, training_modules, chat_messages;

-- Verify data integrity
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles
UNION ALL
SELECT 'Permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'Loads', COUNT(*) FROM loads
UNION ALL
SELECT 'Brokers', COUNT(*) FROM brokers
UNION ALL
SELECT 'Trucks', COUNT(*) FROM trucks
UNION ALL
SELECT 'Expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'Invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'Training Modules', COUNT(*) FROM training_modules
UNION ALL
SELECT 'Chat Messages', COUNT(*) FROM chat_messages;

-- Sample queries to verify relationships
SELECT 
    u.email,
    GROUP_CONCAT(r.display_name) as roles,
    u.has_training_access,
    COUNT(tp.id) as training_modules_assigned
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN training_progress tp ON u.id = tp.user_id
GROUP BY u.id
ORDER BY u.id;

-- Final confirmation message
SELECT 'Database seeded successfully with enterprise test data!' as status,
       'All passwords are bcrypt hashed version of: admin123' as note,
       'Ready for development and testing' as ready_status;

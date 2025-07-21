-- AOL TMS Database Schema
-- Transportation Management System Complete Database Structure

DROP DATABASE IF EXISTS aol_tms;
CREATE DATABASE aol_tms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aol_tms;

-- Users and Authentication Tables
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'dispatcher', 'driver', 'accountant', 'it_support') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_online BOOLEAN DEFAULT FALSE,
    has_training_access BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(32),
    avatar_url VARCHAR(500),
    last_login TIMESTAMP NULL,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- User Sessions Table
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (session_token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at)
);

-- Fleet Management Tables
CREATE TABLE trucks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    truck_number VARCHAR(50) NOT NULL UNIQUE,
    make VARCHAR(100),
    model VARCHAR(100),
    year INT,
    vin VARCHAR(17) UNIQUE,
    license_plate VARCHAR(20),
    status ENUM('active', 'maintenance', 'inactive', 'retired') DEFAULT 'active',
    fuel_capacity DECIMAL(8,2),
    max_weight DECIMAL(10,2),
    current_mileage INT DEFAULT 0,
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    insurance_expiry DATE,
    registration_expiry DATE,
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_truck_number (truck_number),
    INDEX idx_status (status)
);

-- Driver Assignments
CREATE TABLE driver_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    truck_id INT,
    assigned_date DATE NOT NULL,
    unassigned_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE SET NULL,
    INDEX idx_driver_id (driver_id),
    INDEX idx_truck_id (truck_id),
    INDEX idx_active (is_active)
);

-- Customers Table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    credit_limit DECIMAL(12,2) DEFAULT 0,
    payment_terms INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Loads and Shipments
CREATE TABLE loads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    load_number VARCHAR(100) NOT NULL UNIQUE,
    rate_con_number VARCHAR(100),
    customer_id INT NOT NULL,
    dispatcher_id INT,
    driver_id INT,
    truck_id INT,
    pickup_location TEXT NOT NULL,
    pickup_city VARCHAR(100),
    pickup_state VARCHAR(50),
    pickup_zip VARCHAR(20),
    pickup_date DATETIME,
    pickup_contact_name VARCHAR(255),
    pickup_contact_phone VARCHAR(20),
    delivery_location TEXT NOT NULL,
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(50),
    delivery_zip VARCHAR(20),
    delivery_date DATETIME,
    delivery_contact_name VARCHAR(255),
    delivery_contact_phone VARCHAR(20),
    commodity VARCHAR(255),
    weight DECIMAL(10,2),
    pieces INT,
    distance_miles DECIMAL(8,2),
    rate DECIMAL(10,2) NOT NULL,
    fuel_surcharge DECIMAL(8,2) DEFAULT 0,
    accessorial_charges DECIMAL(8,2) DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (rate + fuel_surcharge + accessorial_charges) STORED,
    status ENUM('pending', 'assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery', 'delivered', 'completed', 'cancelled') DEFAULT 'pending',
    special_instructions TEXT,
    equipment_type VARCHAR(100),
    temperature_controlled BOOLEAN DEFAULT FALSE,
    hazmat BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (dispatcher_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE SET NULL,
    INDEX idx_load_number (load_number),
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_pickup_date (pickup_date),
    INDEX idx_delivery_date (delivery_date)
);

-- Load Status History
CREATE TABLE load_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    load_id INT NOT NULL,
    status ENUM('pending', 'assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery', 'delivered', 'completed', 'cancelled') NOT NULL,
    updated_by INT,
    location VARCHAR(255),
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (load_id) REFERENCES loads(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_load_id (load_id),
    INDEX idx_timestamp (timestamp)
);

-- Documents Management
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    load_id INT,
    user_id INT NOT NULL,
    document_type ENUM('bol', 'pod', 'rate_confirmation', 'invoice', 'receipt', 'permit', 'insurance', 'photo', 'other') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100),
    category VARCHAR(100),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (load_id) REFERENCES loads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_load_id (load_id),
    INDEX idx_user_id (user_id),
    INDEX idx_document_type (document_type)
);

-- Invoicing System
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    load_id INT NOT NULL,
    customer_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(8,2) DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
    status ENUM('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    payment_method ENUM('check', 'ach', 'wire', 'quick_pay', 'zelle', 'cash') NULL,
    payment_reference VARCHAR(255),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    sent_date DATE NULL,
    paid_date DATE NULL,
    created_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (load_id) REFERENCES loads(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

-- Expense Management
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    load_id INT,
    truck_id INT,
    driver_id INT,
    category ENUM('fuel', 'maintenance', 'tolls', 'permits', 'insurance', 'repairs', 'tires', 'other') NOT NULL,
    subcategory VARCHAR(100),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(8,2) DEFAULT 0,
    vendor VARCHAR(255),
    receipt_number VARCHAR(100),
    expense_date DATE NOT NULL,
    location VARCHAR(255),
    mileage INT,
    gallons DECIMAL(8,2),
    price_per_gallon DECIMAL(6,3),
    submitted_by INT NOT NULL,
    approved_by INT,
    approval_date DATE,
    status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
    reimbursable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (load_id) REFERENCES loads(id) ON DELETE SET NULL,
    FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE SET NULL,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_expense_date (expense_date),
    INDEX idx_status (status),
    INDEX idx_submitted_by (submitted_by)
);

-- Training System
CREATE TABLE training_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE training_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    content_type ENUM('pdf', 'video', 'youtube', 'image', 'text') NOT NULL,
    file_path VARCHAR(500),
    youtube_url VARCHAR(500),
    content TEXT,
    duration_minutes INT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES training_categories(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_category_id (category_id),
    INDEX idx_is_active (is_active)
);

CREATE TABLE user_training_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    module_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'failed') DEFAULT 'not_started',
    score DECIMAL(5,2),
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    attempts INT DEFAULT 0,
    time_spent_minutes INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_module (user_id, module_id),
    INDEX idx_user_id (user_id),
    INDEX idx_module_id (module_id),
    INDEX idx_status (status)
);

-- System Monitoring and Logs
CREATE TABLE system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_data JSON,
    response_data JSON,
    severity ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_severity (severity),
    INDEX idx_timestamp (timestamp)
);

CREATE TABLE security_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_type ENUM('login_success', 'login_failed', 'logout', 'password_change', 'mfa_setup', 'mfa_verification', 'account_locked', 'permission_denied') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_risk_level (risk_level),
    INDEX idx_timestamp (timestamp)
);

-- Notifications System
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    category ENUM('system', 'load', 'payment', 'maintenance', 'training', 'security') NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- Settings and Configuration
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    data_type ENUM('string', 'integer', 'decimal', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_setting_key (setting_key)
);

-- Encryption Keys Management
CREATE TABLE encryption_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) NOT NULL UNIQUE,
    key_value TEXT NOT NULL,
    algorithm VARCHAR(50) DEFAULT 'AES-256',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    last_rotation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rotation_count INT DEFAULT 0,
    INDEX idx_key_name (key_name),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at)
);

-- Performance Metrics
CREATE TABLE performance_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    entity_type VARCHAR(50),
    entity_id INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_name (metric_name),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_recorded_at (recorded_at)
);

-- Create views for common queries
CREATE VIEW active_loads AS
SELECT 
    l.*,
    c.name as customer_name,
    u1.first_name as dispatcher_first_name,
    u1.last_name as dispatcher_last_name,
    u2.first_name as driver_first_name,
    u2.last_name as driver_last_name,
    t.truck_number
FROM loads l
LEFT JOIN customers c ON l.customer_id = c.id
LEFT JOIN users u1 ON l.dispatcher_id = u1.id
LEFT JOIN users u2 ON l.driver_id = u2.id
LEFT JOIN trucks t ON l.truck_id = t.id
WHERE l.status NOT IN ('completed', 'cancelled');

CREATE VIEW user_dashboard_stats AS
SELECT 
    u.id,
    u.role,
    COUNT(DISTINCT CASE WHEN l.status IN ('assigned', 'en_route_pickup', 'picked_up', 'en_route_delivery') THEN l.id END) as active_loads,
    COUNT(DISTINCT CASE WHEN l.status = 'delivered' AND DATE(l.updated_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN l.id END) as completed_loads_30_days,
    SUM(CASE WHEN i.status = 'paid' AND DATE(i.paid_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN i.total_amount ELSE 0 END) as revenue_30_days
FROM users u
LEFT JOIN loads l ON (u.role = 'driver' AND l.driver_id = u.id) OR (u.role = 'dispatcher' AND l.dispatcher_id = u.id)
LEFT JOIN invoices i ON l.id = i.load_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.role;

-- AOL TMS Database Schema
-- Zero Trust Security Architecture
-- Compatible with XAMPP MySQL and Cloud MySQL

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS aol_tms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aol_tms;

-- =============================================
-- CORE USER MANAGEMENT & SECURITY
-- =============================================

-- Users table with zero trust security
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- bcrypt hashed
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'dispatcher', 'driver', 'accountant', 'it_support') NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    
    -- Security fields
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    must_change_password BOOLEAN DEFAULT TRUE,
    
    -- Session management
    last_login TIMESTAMP NULL,
    last_ip VARCHAR(45),
    current_session_token VARCHAR(255),
    
    -- MFA settings
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    backup_codes JSON,
    
    -- Preferences
    theme_mode ENUM('light', 'dark', 'system') DEFAULT 'system',
    theme_color ENUM('blue', 'slate', 'emerald', 'orange', 'purple', 'red', 'teal', 'indigo') DEFAULT 'blue',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active),
    INDEX idx_employee (employee_id)
);

-- User sessions for zero trust
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    device_fingerprint VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    location_country VARCHAR(2),
    location_city VARCHAR(100),
    is_mobile BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    revoked_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_session (user_id),
    INDEX idx_token (session_token),
    INDEX idx_expires (expires_at)
);

-- Security events audit log
CREATE TABLE security_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    event_type ENUM('login_success', 'login_failed', 'logout', 'password_changed', 
                   'mfa_enabled', 'mfa_disabled', 'account_locked', 'account_unlocked',
                   'permission_denied', 'suspicious_activity', 'data_access', 'data_modified') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    location_country VARCHAR(2),
    location_city VARCHAR(100),
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_events (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_risk_level (risk_level),
    INDEX idx_created (created_at)
);

-- Role-based permissions
CREATE TABLE roles_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role ENUM('admin', 'dispatcher', 'driver', 'accountant', 'it_support') NOT NULL,
    permission VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action ENUM('create', 'read', 'update', 'delete', 'execute') NOT NULL,
    conditions JSON, -- Additional conditions for permission
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_permission (role, permission, resource, action),
    INDEX idx_role_permission (role, permission)
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires (expires_at)
);

-- =============================================
-- TRANSPORTATION MANAGEMENT
-- =============================================

-- Vehicle/Truck management
CREATE TABLE trucks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    truck_number VARCHAR(50) UNIQUE NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vin_number VARCHAR(17) UNIQUE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(30),
    
    -- Specifications
    gross_weight INT, -- in pounds
    max_payload INT, -- in pounds
    fuel_type ENUM('diesel', 'gasoline', 'electric', 'hybrid') DEFAULT 'diesel',
    transmission ENUM('manual', 'automatic') DEFAULT 'automatic',
    
    -- Status and maintenance
    status ENUM('active', 'maintenance', 'out_of_service', 'sold') DEFAULT 'active',
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_miles INT DEFAULT 0,
    current_mileage INT DEFAULT 0,
    
    -- Insurance and registration
    insurance_policy VARCHAR(100),
    insurance_expires DATE,
    registration_expires DATE,
    dot_inspection_expires DATE,
    
    -- Financial
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    current_value DECIMAL(12,2),
    monthly_payment DECIMAL(10,2),
    
    -- Assignment
    assigned_driver_id INT,
    home_terminal VARCHAR(100),
    
    -- GPS and tracking
    gps_device_id VARCHAR(100),
    last_gps_update TIMESTAMP,
    current_location_lat DECIMAL(10, 8),
    current_location_lng DECIMAL(11, 8),
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    
    FOREIGN KEY (assigned_driver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_truck_number (truck_number),
    INDEX idx_status (status),
    INDEX idx_assigned_driver (assigned_driver_id)
);

-- Load/Shipment management
CREATE TABLE loads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    load_number VARCHAR(50) UNIQUE NOT NULL,
    customer_reference VARCHAR(100),
    
    -- Customer information
    customer_name VARCHAR(255) NOT NULL,
    customer_contact VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    
    -- Pickup information
    pickup_address TEXT NOT NULL,
    pickup_city VARCHAR(100) NOT NULL,
    pickup_state VARCHAR(50) NOT NULL,
    pickup_zip VARCHAR(20) NOT NULL,
    pickup_country VARCHAR(50) DEFAULT 'USA',
    pickup_date DATE NOT NULL,
    pickup_time TIME,
    pickup_contact VARCHAR(255),
    pickup_phone VARCHAR(20),
    pickup_instructions TEXT,
    
    -- Delivery information
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100) NOT NULL,
    delivery_state VARCHAR(50) NOT NULL,
    delivery_zip VARCHAR(20) NOT NULL,
    delivery_country VARCHAR(50) DEFAULT 'USA',
    delivery_date DATE NOT NULL,
    delivery_time TIME,
    delivery_contact VARCHAR(255),
    delivery_phone VARCHAR(20),
    delivery_instructions TEXT,
    
    -- Load details
    commodity VARCHAR(255) NOT NULL,
    weight DECIMAL(10,2), -- in pounds
    pieces INT DEFAULT 1,
    dimensions VARCHAR(100), -- LxWxH
    special_instructions TEXT,
    hazmat BOOLEAN DEFAULT FALSE,
    temperature_controlled BOOLEAN DEFAULT FALSE,
    target_temperature VARCHAR(20),
    
    -- Assignment and status
    status ENUM('posted', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled') DEFAULT 'posted',
    assigned_driver_id INT,
    assigned_truck_id INT,
    dispatcher_id INT,
    
    -- Financial
    rate DECIMAL(10,2) NOT NULL,
    fuel_surcharge DECIMAL(10,2) DEFAULT 0,
    additional_charges DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (rate + fuel_surcharge + additional_charges) STORED,
    
    -- Tracking
    miles INT,
    estimated_delivery TIMESTAMP,
    actual_pickup TIMESTAMP,
    actual_delivery TIMESTAMP,
    
    -- Documents
    bol_uploaded BOOLEAN DEFAULT FALSE,
    pod_uploaded BOOLEAN DEFAULT FALSE,
    invoice_sent BOOLEAN DEFAULT FALSE,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    
    FOREIGN KEY (assigned_driver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_truck_id) REFERENCES trucks(id) ON DELETE SET NULL,
    FOREIGN KEY (dispatcher_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_load_number (load_number),
    INDEX idx_status (status),
    INDEX idx_assigned_driver (assigned_driver_id),
    INDEX idx_pickup_date (pickup_date),
    INDEX idx_delivery_date (delivery_date)
);

-- =============================================
-- FINANCIAL MANAGEMENT
-- =============================================

-- Invoices
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    load_id INT,
    
    -- Customer billing
    bill_to_company VARCHAR(255) NOT NULL,
    bill_to_address TEXT,
    bill_to_contact VARCHAR(255),
    bill_to_email VARCHAR(255),
    
    -- Invoice details
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    terms VARCHAR(50) DEFAULT 'NET 30',
    
    -- Financial
    subtotal DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
    
    -- Status
    status ENUM('draft', 'sent', 'viewed', 'partial_paid', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    sent_date TIMESTAMP NULL,
    viewed_date TIMESTAMP NULL,
    
    -- Payment tracking
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    paid_date TIMESTAMP NULL,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    
    FOREIGN KEY (load_id) REFERENCES loads(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_load (load_id)
);

-- Expenses tracking
CREATE TABLE expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expense_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Expense details
    category ENUM('fuel', 'maintenance', 'insurance', 'permits', 'tolls', 'meals', 'lodging', 'other') NOT NULL,
    subcategory VARCHAR(100),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    
    -- Association
    truck_id INT,
    load_id INT,
    driver_id INT,
    vendor VARCHAR(255),
    
    -- Documentation
    receipt_uploaded BOOLEAN DEFAULT FALSE,
    receipt_path VARCHAR(500),
    notes TEXT,
    
    -- Approval workflow
    status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    
    -- Payment
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    paid_date TIMESTAMP NULL,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    
    FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE SET NULL,
    FOREIGN KEY (load_id) REFERENCES loads(id) ON DELETE SET NULL,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_expense_number (expense_number),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_expense_date (expense_date),
    INDEX idx_truck (truck_id),
    INDEX idx_driver (driver_id)
);

-- =============================================
-- SYSTEM MANAGEMENT
-- =============================================

-- Documents management
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Association
    entity_type ENUM('load', 'truck', 'user', 'invoice', 'expense') NOT NULL,
    entity_id INT NOT NULL,
    document_type VARCHAR(100), -- BOL, POD, Insurance, etc.
    
    -- Security
    access_level ENUM('public', 'internal', 'confidential', 'restricted') DEFAULT 'internal',
    encrypted BOOLEAN DEFAULT FALSE,
    
    -- Audit
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_document_type (document_type),
    INDEX idx_uploaded_by (uploaded_by)
);

-- System notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    
    -- Targeting
    target_roles JSON, -- Array of roles if role-based
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    
    -- Action
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_notifications (user_id),
    INDEX idx_unread (user_id, is_read),
    INDEX idx_priority (priority)
);

-- Training system
CREATE TABLE training_modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    
    -- Targeting
    required_for_roles JSON, -- Array of roles
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    estimated_duration INT, -- in minutes
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_mandatory BOOLEAN DEFAULT FALSE,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_active (is_active),
    INDEX idx_mandatory (is_mandatory)
);

-- Training progress tracking
CREATE TABLE training_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    module_id INT NOT NULL,
    
    -- Progress
    status ENUM('not_started', 'in_progress', 'completed', 'expired') DEFAULT 'not_started',
    progress_percentage INT DEFAULT 0,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    score DECIMAL(5,2), -- For assessments
    
    -- Certification
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_expires_at TIMESTAMP NULL,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_module (user_id, module_id),
    INDEX idx_user_progress (user_id),
    INDEX idx_status (status)
);

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default role permissions
INSERT INTO roles_permissions (role, permission, resource, action) VALUES
-- Admin permissions (full access)
('admin', 'full_access', '*', 'create'),
('admin', 'full_access', '*', 'read'),
('admin', 'full_access', '*', 'update'),
('admin', 'full_access', '*', 'delete'),
('admin', 'full_access', '*', 'execute'),

-- Dispatcher permissions
('dispatcher', 'manage', 'loads', 'create'),
('dispatcher', 'manage', 'loads', 'read'),
('dispatcher', 'manage', 'loads', 'update'),
('dispatcher', 'view', 'trucks', 'read'),
('dispatcher', 'view', 'drivers', 'read'),
('dispatcher', 'manage', 'routes', 'create'),
('dispatcher', 'manage', 'routes', 'update'),

-- Driver permissions
('driver', 'view', 'assigned_loads', 'read'),
('driver', 'update', 'load_status', 'update'),
('driver', 'view', 'own_profile', 'read'),
('driver', 'update', 'own_profile', 'update'),
('driver', 'upload', 'documents', 'create'),

-- Accountant permissions
('accountant', 'manage', 'invoices', 'create'),
('accountant', 'manage', 'invoices', 'read'),
('accountant', 'manage', 'invoices', 'update'),
('accountant', 'manage', 'expenses', 'create'),
('accountant', 'manage', 'expenses', 'read'),
('accountant', 'manage', 'expenses', 'update'),
('accountant', 'view', 'financial_reports', 'read'),

-- IT Support permissions
('it_support', 'manage', 'users', 'create'),
('it_support', 'manage', 'users', 'read'),
('it_support', 'manage', 'users', 'update'),
('it_support', 'view', 'system_logs', 'read'),
('it_support', 'manage', 'training', 'create'),
('it_support', 'manage', 'training', 'read'),
('it_support', 'manage', 'training', 'update');

COMMIT;

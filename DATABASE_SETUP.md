# AOL TMS Database Setup Guide

## Quick Setup for Local Development

### 1. **Start MySQL Service**
- **XAMPP**: Open XAMPP Control Panel → Start MySQL
- **Direct MySQL**: `sudo service mysql start` (Linux) or use MySQL Workbench
- **Verify**: MySQL should be running on `localhost:3306`

### 2. **Create Database**
```sql
CREATE DATABASE aol_tms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. **Import Schema & Data**
```bash
# From project root
cd backend
npm run db:setup
```

### 4. **Verify Setup**
```bash
# Test database connection
npm run validate
```

## Important Schema Changes

**⚠️ Key Update**: The user table now uses `password` field instead of `password_hash`

### Updated Users Table Structure:
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- Changed from password_hash
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'dispatcher', 'driver', 'accountant', 'it_support') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_online BOOLEAN DEFAULT FALSE,
  has_training_access BOOLEAN DEFAULT FALSE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  theme_preference ENUM('light', 'dark', 'system') DEFAULT 'system',
  theme_color ENUM('blue', 'slate', 'emerald', 'orange', 'purple', 'red', 'teal', 'indigo') DEFAULT 'blue',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Test Users (with hashed passwords)

| Email | Password | Role |
|-------|----------|------|
| admin@alloverlogistics.com | admin123 | admin |
| dispatcher@alloverlogistics.com | dispatch123 | dispatcher |
| driver@alloverlogistics.com | driver123 | driver |
| accountant@alloverlogistics.com | account123 | accountant |
| it@alloverlogistics.com | support123 | it_support |

## Troubleshooting

### MySQL Connection Failed
```bash
# Check if MySQL is running
sudo service mysql status

# Check if port 3306 is available
netstat -tulpn | grep :3306

# Test connection
mysql -u root -p -h localhost
```

### Authentication Issues
```bash
# Verify password field exists
mysql -u root -p aol_tms -e "DESCRIBE users;"

# Check if test users exist
mysql -u root -p aol_tms -e "SELECT email, role FROM users;"
```

### Reset Database
```bash
cd backend
mysql -u root -p -e "DROP DATABASE IF EXISTS aol_tms;"
mysql -u root -p -e "CREATE DATABASE aol_tms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
npm run db:setup
```

## Production Notes

- Change default passwords in production
- Update JWT_SECRET and ENCRYPTION_KEY
- Use environment variables for database credentials
- Enable SSL connections for remote databases
- Set up proper database backups

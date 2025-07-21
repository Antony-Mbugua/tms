# AOL TMS - Database Setup Instructions

## 🚀 Quick Start

Follow these steps to set up the complete AOL TMS system with MySQL database:

### Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **MySQL 8.0+** - [Download here](https://dev.mysql.com/downloads/mysql/)
3. **Git** (optional) - For cloning the repository

### Step 1: MySQL Database Setup

#### Option A: Using MySQL Command Line
```bash
# Login to MySQL as root
mysql -u root -p

# Create database and user (optional)
CREATE DATABASE aol_tms;
CREATE USER 'aol_user'@'localhost' IDENTIFIED BY 'aol_password';
GRANT ALL PRIVILEGES ON aol_tms.* TO 'aol_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Create a new database named `aol_tms`

### Step 2: Configure Environment Variables

1. Navigate to the `server` directory
2. Copy the `.env` file and update the database credentials:

```bash
cd server
# Edit the .env file with your MySQL credentials
```

Update these variables in `server/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aol_tms
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### Step 3: Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run setup

# OR install separately:
# Frontend dependencies
npm install

# Backend dependencies
cd server && npm install
```

### Step 4: Setup Database Schema and Data

```bash
# Run the database setup script (creates tables and inserts test data)
npm run db:setup
```

This script will:
- Create all necessary database tables
- Insert test users and sample data
- Set up proper relationships and indexes

### Step 5: Start the Application

#### Option A: Start Both Frontend and Backend Together
```bash
npm run dev:full
```

#### Option B: Start Separately (for development)
```bash
# Terminal 1 - Backend API Server (port 5000)
npm run server

# Terminal 2 - Frontend Development Server (port 3001)
npm start
```

### Step 6: Access the Application

1. **Frontend**: http://localhost:3001
2. **Backend API**: http://localhost:5000
3. **Health Check**: http://localhost:5000/health

## 🔐 Test User Credentials

After running the database setup, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@aol.com | password123 |
| **Dispatcher** | dispatcher@aol.com | password123 |
| **Driver** | driver@aol.com | password123 |
| **Accountant** | accountant@aol.com | password123 |
| **IT Support** | it@aol.com | password123 |

## 🔧 Troubleshooting

### Database Connection Issues

1. **Check MySQL Service**:
   ```bash
   # Windows
   net start mysql

   # macOS (Homebrew)
   brew services start mysql

   # Linux
   sudo systemctl start mysql
   ```

2. **Verify Credentials**:
   ```bash
   mysql -u root -p
   SHOW DATABASES;
   ```

3. **Check `.env` Configuration**:
   - Ensure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` are correct
   - Database name should be `aol_tms`

### Port Conflicts

- **Frontend (3001)**: If port 3001 is busy, Vite will automatically use the next available port
- **Backend (5000)**: Change `PORT` in `server/.env` if port 5000 is in use

### API Connection Issues

1. **Check Backend Status**:
   - Visit http://localhost:5000/health
   - Should return: `{"status":"OK","timestamp":"...","environment":"development"}`

2. **CORS Issues**:
   - Backend is configured to allow localhost:3000 and localhost:3001
   - Check browser console for CORS errors

3. **Network Issues**:
   - Try http://127.0.0.1:5000/health instead of localhost

## 📊 Database Schema Overview

The system includes these main tables:

### Core Tables
- `users` - User accounts and authentication
- `user_sessions` - Active user sessions
- `trucks` - Fleet management
- `customers` - Customer information
- `loads` - Shipment/load management

### Operational Tables
- `driver_assignments` - Truck-driver assignments
- `load_status_history` - Load status tracking
- `documents` - Document management
- `invoices` - Billing and invoicing
- `expenses` - Expense tracking

### Training & Security
- `training_modules` - Training content
- `user_training_progress` - Training completion
- `security_events` - Security event logging
- `system_logs` - System activity logs

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Authentication**: Secure token-based auth
- **Session Management**: Tracked in database
- **Security Logging**: All auth events logged
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin request security

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Token verification

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/notifications` - User notifications

### Data Management
- `GET /api/users` - User management (admin only)
- `GET /api/loads` - Load management
- `GET /api/trucks` - Fleet management
- `GET /api/invoices` - Invoice management
- `GET /api/expenses` - Expense tracking
- `GET /api/training/modules` - Training modules

## 🎯 Next Steps

1. **Customize Configuration**: Update company details in `system_settings` table
2. **Add Real Data**: Replace sample data with your actual fleet/customer information
3. **Configure Email**: Set up SMTP settings for notifications
4. **SSL/HTTPS**: Configure SSL certificates for production
5. **Backup Strategy**: Implement database backup procedures

## 📞 Support

If you encounter any issues:

1. Check the console output for error messages
2. Verify all prerequisites are installed
3. Ensure MySQL is running and accessible
4. Check the database connection in `server/.env`
5. Review the logs in the terminal where you started the services

The system should now be fully functional with real database integration!

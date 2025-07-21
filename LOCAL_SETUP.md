# AOL TMS - Local Development Setup with XAMPP

## 🚀 **Complete Local Setup Guide**

Since you've cloned the repo and have XAMPP, let's set up the complete real project locally.

### **Step 1: XAMPP Configuration**

1. **Start XAMPP Control Panel**
2. **Start Apache and MySQL services**
3. **Open phpMyAdmin**: http://localhost/phpmyadmin
4. **Create database**: 
   - Click "New" 
   - Database name: `aol_tms`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

### **Step 2: Database Configuration**

Update your `server/.env` file:

```env
# Database Configuration (XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aol_tms
DB_USER=root
DB_PASSWORD=
```

**Note**: XAMPP MySQL usually has no password by default. If you set a password, update it accordingly.

### **Step 3: Install Dependencies**

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

# Go back to root
cd ..
```

### **Step 4: Setup Database with Real Data**

```bash
# Run the complete database setup
npm run db:setup
```

This will:
- ✅ Create all 15+ database tables
- ✅ Insert test users with hashed passwords
- ✅ Add sample loads, trucks, customers
- ✅ Set up payment accounts and SPII encryption
- ✅ Configure training modules and security logs

### **Step 5: Start the Complete System**

```bash
# Start both frontend and backend together
npm run dev:full
```

This will start:
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000

### **Step 6: Test the Real System**

1. **Backend Health Check**: http://localhost:5000/health
   - Should return: `{"status":"OK","timestamp":"...","environment":"development"}`

2. **Frontend Login**: http://localhost:3000
   - Should show the login page without demo banner

3. **Login Credentials** (real database users):
   - **Admin**: admin@aol.com / password123
   - **Dispatcher**: dispatcher@aol.com / password123
   - **Driver**: driver@aol.com / password123
   - **Accountant**: accountant@aol.com / password123
   - **IT Support**: it@aol.com / password123

## 🔧 **Troubleshooting**

### **Database Connection Issues**

If you get "Database connection failed":

1. **Check XAMPP MySQL Status**:
   ```bash
   # In XAMPP Control Panel, ensure MySQL is "Running"
   ```

2. **Test MySQL Connection**:
   ```bash
   mysql -u root -p
   # Press Enter if no password, or type your password
   SHOW DATABASES;
   ```

3. **Check Database Exists**:
   ```sql
   USE aol_tms;
   SHOW TABLES;
   ```

4. **Verify .env Configuration**:
   ```bash
   # In server/.env, ensure:
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=          # Empty if no password
   DB_NAME=aol_tms
   ```

### **Port Conflicts**

If ports are in use:

- **Backend (5000)**: Change `PORT=5001` in `server/.env`
- **Frontend (3000)**: Vite will auto-select next available port

### **API Connection Issues**

1. **Check Backend is Running**:
   - Terminal should show: "🚚 AOL TMS Server running on port 5000"
   - Visit: http://localhost:5000/health

2. **Check Database Connection**:
   - Backend should show: "✅ Database connected successfully"
   - If not, review database troubleshooting above

3. **CORS Issues**:
   - Backend is configured for localhost:3000
   - If frontend runs on different port, update CORS in `server/server.js`

## 📊 **Database Schema Overview**

Your real database includes:

### **Core Tables**
- `users` - User accounts with encrypted phone/account numbers
- `trucks` - Fleet management
- `loads` - Shipment tracking
- `customers` - Customer management
- `invoices` - Billing system

### **Enhanced Features**
- `payment_accounts` - Secure payment processing
- `user_preferences` - Theme and UI settings
- `spii_encryption_keys` - Data encryption
- `password_reset_tokens` - Secure password recovery
- `security_events` - Audit logging
- `training_modules` - Learning management

## 🔐 **Security Features**

Your local system includes:

- ✅ **Password Hashing**: bcrypt with 12 rounds
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **SPII Encryption**: Phone numbers and account data encrypted
- ✅ **Audit Logging**: All sensitive data access tracked
- ✅ **Session Management**: Secure session handling
- ✅ **Password Reset**: Email/SMS verification system

## 🎨 **Features Available**

### **Login System**
- ✅ Real authentication with database verification
- ✅ Theme customization (8 color options)
- ✅ Remember me functionality
- ✅ Password reset with email/SMS
- ✅ MFA setup in user profiles

### **Role-Based Dashboards**
- ✅ **Admin**: User management, system analytics
- ✅ **Dispatcher**: Load assignment, trip planning
- ✅ **Driver**: Trip management, document upload
- ✅ **Accountant**: Invoicing, expense tracking
- ✅ **IT Support**: System monitoring, security logs

### **Advanced Features**
- ✅ **Training Management**: Upload modules, track progress
- ✅ **Document Management**: Secure file upload/download
- ✅ **Payment Processing**: Driver pay, expense reimbursement
- ✅ **Analytics**: Performance metrics, financial reports

## ✅ **Verification Checklist**

After setup, verify these work:

- [ ] XAMPP MySQL is running
- [ ] Database `aol_tms` exists with 15+ tables
- [ ] Backend starts without database connection errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Login works with admin@aol.com / password123
- [ ] Dashboard shows real data from database
- [ ] Theme customization works
- [ ] User can navigate between different role dashboards

## 🎯 **Next Steps**

Once your local system is running:

1. **Customize Data**: Add your own trucks, drivers, customers
2. **Test Features**: Try all dashboards and functionality
3. **Configure Email**: Set up SMTP for password reset emails
4. **Add Users**: Create additional user accounts
5. **Upload Documents**: Test file upload functionality

Your local AOL TMS system is now a fully functional enterprise-grade transportation management platform! 🚚

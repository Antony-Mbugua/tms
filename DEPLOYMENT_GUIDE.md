# AOL TMS Deployment Guide

This guide covers both local development with XAMPP and cloud deployment on Hostinger.

## 🏠 Local Development Setup (XAMPP)

### Prerequisites
- XAMPP installed with MySQL and Apache
- Node.js 16+ installed
- Git installed

### 1. Database Setup
1. Start XAMPP Control Panel and start MySQL service
2. Open phpMyAdmin: `http://localhost/phpmyadmin`
3. Create new database: `aol_tms`

### 2. Environment Configuration
```bash
# Copy environment template
cp server/.env.example server/.env

# Edit server/.env for XAMPP
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aol_tms
DB_USER=root
DB_PASSWORD=
```

### 3. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

### 4. Setup Database
```bash
# Run database setup (creates tables and seeds data)
npm run db:setup
```

### 5. Start Development Servers
```bash
# Start both frontend and backend
npm run dev:full

# Or start individually:
# Frontend: npm run dev
# Backend: npm run server
```

### 6. Access Application
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/health`

### Test Login Credentials
- **Admin**: admin@alloverlogistics.com / admin123
- **Dispatcher**: dispatcher@alloverlogistics.com / dispatch123
- **Driver**: driver@alloverlogistics.com / driver123
- **Accountant**: accountant@alloverlogistics.com / account123
- **IT Support**: it@alloverlogistics.com / support123

---

## ☁️ Hostinger Cloud Deployment

### Prerequisites
- Hostinger Cloud Starter plan or higher
- Domain configured
- MySQL database created in Hostinger panel

### 1. Database Setup on Hostinger
1. Login to Hostinger control panel
2. Go to Databases → MySQL Databases
3. Create new database: `your_database_name`
4. Note down: host, database name, username, password

### 2. Upload Files
```bash
# Build the application
npm run build

# Upload built files to your domain's public_html folder
# Upload server folder to a secure location (not public_html)
```

### 3. Environment Configuration for Production
Create `server/.env` on the server:
```bash
# Production Configuration
PORT=5000
NODE_ENV=production

# Hostinger Database Configuration
DB_HOST=your-mysql-host.mysql.hostinger.com
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_CONNECTION_LIMIT=5

# Security (Generate strong secrets!)
JWT_SECRET=your_super_secure_jwt_secret_here
ENCRYPTION_KEY=your_super_secure_encryption_key_here

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

### 4. Database Setup on Production
```bash
# SSH to your server and run:
cd /path/to/server
node scripts/setup-database.js
```

### 5. Process Management
Use PM2 or similar to keep the Node.js server running:
```bash
# Install PM2
npm install -g pm2

# Start the server
pm2 start server.js --name "aol-tms-server"

# Auto-restart on server reboot
pm2 startup
pm2 save
```

### 6. Reverse Proxy Configuration
Configure your web server (Apache/Nginx) to proxy API requests:

**Apache (.htaccess example):**
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
```

**Nginx example:**
```nginx
location /api/ {
    proxy_pass http://localhost:5000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## 🔧 Configuration Details

### Environment Variables Reference

| Variable | Local (XAMPP) | Production | Description |
|----------|---------------|------------|-------------|
| `DB_HOST` | `localhost` | `your-host.mysql.hostinger.com` | Database host |
| `DB_PASSWORD` | `` (empty) | `your_password` | Database password |
| `NODE_ENV` | `development` | `production` | Environment mode |
| `JWT_SECRET` | Use default | Generate secure key | JWT signing secret |
| `FRONTEND_URL` | `http://localhost:3000` | `https://your-domain.com` | Frontend URL for emails |

### Port Configuration
- **Frontend**: 3000 (Vite dev server)
- **Backend**: 5000 (Express server)
- **MySQL**: 3306 (default)

### Database Tables Created
- `users` - User accounts and authentication
- `trucks` - Vehicle management
- `loads` - Load/shipment tracking
- `invoices` - Billing and invoicing
- `expenses` - Expense tracking
- `training_modules` - Training system
- `user_sessions` - Session management
- `security_events` - Security audit log
- `password_reset_tokens` - Password reset system
- And more...

---

## 🚀 Verification Steps

### 1. Health Check
Visit the health endpoint to verify everything is working:
- Local: `http://localhost:5000/health`
- Production: `https://your-domain.com/api/../health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "database": "connected",
  "version": "1.0.0"
}
```

### 2. Frontend Connection Status
In development mode, a connection status widget appears in the bottom-right corner showing:
- Environment (development/production)
- API Server status
- Database status
- Connection latency

### 3. Test Authentication
Try logging in with the test credentials to verify the complete authentication flow.

---

## 🛠️ Troubleshooting

### Common XAMPP Issues
1. **MySQL won't start**: Check if port 3306 is available
2. **Database connection failed**: Verify MySQL is running
3. **Empty password error**: Ensure `DB_PASSWORD=` (empty) in `.env`

### Common Hostinger Issues
1. **Database connection failed**: Verify host, username, password
2. **CORS errors**: Check server CORS configuration
3. **File upload limits**: Adjust PHP settings if needed

### API Connection Issues
1. **NetworkError**: Check if backend server is running
2. **404 errors**: Verify API routes and base URL
3. **CORS errors**: Update CORS origins in server configuration

### Performance Optimization
1. Enable compression middleware (already configured)
2. Use connection pooling (already configured)
3. Implement proper caching headers
4. Monitor database query performance

---

## 📞 Support

For technical support or questions:
- Check the connection status widget (development mode)
- Review server logs for detailed error information
- Verify environment configuration matches this guide
- Test the health endpoint for system status

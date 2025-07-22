# AOL TMS Deployment Guide

## 🚀 Complete Deployment Process

This guide covers deploying AOL TMS to Hostinger Cloud Starter Package and local XAMPP development.

## 📋 Prerequisites

### For Hostinger Deployment:
- Hostinger Cloud Starter Package subscription
- Domain name configured
- MySQL database access
- SSH access (if available)
- FTP/File Manager access

### For XAMPP Development:
- XAMPP 8.0+ with MySQL and Apache
- Node.js 16+ installed
- Git installed

## 🏗️ Project Structure Overview

```
aol-tms/
├── frontend/          # React + TypeScript (Port 3000)
│   ├── src/
│   ├── public/
│   └── dist/         # Built files for production
├── backend/           # Node.js + Express (Port 5000)
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── uploads/      # File storage
├── database/          # MySQL schema and seeds
│   ├── schema.sql
│   └── seeders.sql
└── deployment/        # Deployment scripts
```

## 🛠️ Local Development Setup (XAMPP)

### Step 1: Environment Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd aol-tms

# Install root dependencies
npm install

# Setup frontend and backend
npm run setup
```

### Step 2: XAMPP Configuration
1. **Start XAMPP Services**:
   - Open XAMPP Control Panel
   - Start Apache and MySQL services
   - Ensure MySQL runs on port 3306

2. **Create Database**:
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Create new database: `aol_tms`
   - Set collation: `utf8mb4_unicode_ci`

### Step 3: Backend Configuration
```bash
# Create backend environment file
cd backend
cp .env.example .env

# Edit .env for XAMPP
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aol_tms
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your_super_secure_jwt_secret_change_in_production_min_32_chars
ENCRYPTION_KEY=your_super_secure_encryption_key_change_in_production_32_chars
FRONTEND_URL=http://localhost:3000
```

### Step 4: Database Setup
```bash
# Setup database schema and seed data
npm run db:setup

# Verify setup
npm run validate
```

### Step 5: Start Development
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
# Frontend: cd frontend && npm run dev
# Backend: cd backend && npm run dev
```

### Step 6: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## ☁️ Hostinger Cloud Deployment

### Step 1: Prepare Hostinger Environment

1. **Database Setup**:
   - Login to Hostinger Panel
   - Navigate to Databases → MySQL Databases
   - Create database: `your_username_aol_tms`
   - Note credentials: host, username, password

2. **Domain Configuration**:
   - Point domain to Hostinger hosting
   - Enable SSL certificate
   - Configure subdomain for API if needed

### Step 2: Build Application
```bash
# Build frontend for production
cd frontend
npm install
npm run build

# This creates 'dist' folder with static files
```

### Step 3: Upload Files

#### Option A: File Manager (Recommended)
1. **Upload Frontend**:
   - Compress `frontend/dist/*` contents
   - Upload to `public_html/` directory
   - Extract files in root directory

2. **Upload Backend**:
   - Compress `backend/` folder (exclude node_modules)
   - Upload to secure folder outside public_html
   - Example: `/home/username/backend/`

#### Option B: FTP Upload
```bash
# Using FTP client (FileZilla, WinSCP, etc.)
# Upload frontend/dist/* to public_html/
# Upload backend/ to secure location
```

### Step 4: Hostinger Backend Configuration

1. **Environment Setup**:
```bash
# Create .env in backend folder on server
NODE_ENV=production
PORT=5000
DB_HOST=your-mysql-host.mysql.hostinger.com
DB_PORT=3306
DB_NAME=your_username_aol_tms
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=generate_strong_32_character_secret_for_production
ENCRYPTION_KEY=generate_strong_32_character_key_for_production
FRONTEND_URL=https://your-domain.com
```

2. **Install Dependencies** (if SSH available):
```bash
ssh your-username@your-server.hostinger.com
cd /home/username/backend
npm install --production
```

### Step 5: Database Deployment
```bash
# Option A: phpMyAdmin (Web Interface)
# 1. Access phpMyAdmin from Hostinger panel
# 2. Select your database
# 3. Import database/schema.sql
# 4. Import database/seeders.sql

# Option B: MySQL Command Line (if SSH available)
mysql -h your-mysql-host -u username -p database_name < database/schema.sql
mysql -h your-mysql-host -u username -p database_name < database/seeders.sql
```

### Step 6: Web Server Configuration

#### Apache (.htaccess for public_html)
```apache
# Frontend routing
RewriteEngine On

# API proxy to backend
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
RewriteRule ^health$ http://localhost:5000/health [P,L]

# Frontend SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

#### Nginx Configuration (if available)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/public_html;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/health;
    }
}
```

### Step 7: Start Backend Service

#### Option A: PM2 (Recommended if available)
```bash
# Install PM2
npm install -g pm2

# Start application
cd /home/username/backend
pm2 start server.js --name "aol-tms"
pm2 startup
pm2 save
```

#### Option B: Forever
```bash
npm install -g forever
forever start server.js
```

#### Option C: Supervisor/Systemd (Advanced)
Create systemd service file for automatic restart.

## 🔐 Security Configuration

### SSL Certificate
```bash
# Hostinger provides free SSL
# Enable in Hostinger panel under SSL section
# Update environment variables to use https://
```

### Database Security
```sql
-- Create dedicated database user (recommended)
CREATE USER 'aol_tms_user'@'%' IDENTIFIED BY 'strong_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON aol_tms.* TO 'aol_tms_user'@'%';
FLUSH PRIVILEGES;
```

### Environment Variables
```bash
# Generate secure keys
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Use in production .env
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check application status
curl https://your-domain.com/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {"status": "healthy"},
  "version": "2.0.0"
}
```

### Log Management
```bash
# Backend logs
tail -f /home/username/backend/logs/app.log

# PM2 logs
pm2 logs aol-tms
```

### Database Backup
```bash
# Daily backup script
mysqldump -h host -u user -p database_name > backup_$(date +%Y%m%d).sql

# Automated backups via cron
0 2 * * * /path/to/backup-script.sh
```

## 🧪 Testing Deployment

### Step 1: Verify Services
```bash
# Check backend health
curl https://your-domain.com/health

# Check database connection
curl https://your-domain.com/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alloverlogistics.com","password":"admin123"}'
```

### Step 2: Test Features
1. **Login Process**: Test with provided credentials
2. **Dashboard Access**: Verify role-based access
3. **File Upload**: Test document upload functionality
4. **Database Operations**: Create/read/update/delete operations

### Step 3: Performance Testing
```bash
# Load testing with Apache Bench
ab -n 100 -c 10 https://your-domain.com/api/dashboard/stats
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check credentials
mysql -h host -u user -p -e "SELECT 1"

# Verify firewall/security groups
# Check Hostinger database access restrictions
```

#### Backend Not Starting
```bash
# Check logs
pm2 logs aol-tms

# Common issues:
# - Missing dependencies: npm install
# - Wrong node version: use node 16+
# - Permission issues: check file permissions
```

#### Frontend 404 Errors
```bash
# Check .htaccess rewrite rules
# Verify file upload to correct directory
# Check Apache mod_rewrite enabled
```

#### API CORS Errors
```bash
# Update backend CORS configuration
# Verify FRONTEND_URL in .env
# Check SSL certificate status
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Check logs and health status
2. **Monthly**: Database optimization and cleanup
3. **Quarterly**: Security updates and patches
4. **Annually**: SSL certificate renewal

### Backup Strategy
1. **Database**: Daily automated backups
2. **Files**: Weekly file system backups
3. **Code**: Version control with Git
4. **Recovery**: Tested restore procedures

### Monitoring Alerts
- Database connection failures
- High error rates
- Performance degradation
- Security events

## 🔗 Additional Resources

- [Hostinger Documentation](https://www.hostinger.com/tutorials/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Test Credentials

**Default Login Credentials (Change in Production):**
- **Admin**: admin@alloverlogistics.com / admin123
- **Dispatcher**: dispatcher@alloverlogistics.com / admin123
- **Driver**: driver@alloverlogistics.com / admin123
- **Accountant**: accountant@alloverlogistics.com / admin123
- **IT Support**: it@alloverlogistics.com / admin123

⚠️ **Important**: Change all default passwords before production deployment!

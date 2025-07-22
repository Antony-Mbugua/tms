# AOL TMS Production Deployment Guide

Deploy your AOL TMS system to any hosting provider with MySQL support.

## 🏗️ Quick Deployment Steps

### 1. Build the Application
```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Build frontend
npm run build

# Setup database (local test)
npm run db:setup
```

### 2. Configure Database (Any MySQL Provider)

**Copy and configure environment:**
```bash
cp server/.env.example server/.env
```

**Update `server/.env` with your MySQL credentials:**
```env
# Production Configuration
PORT=5000
NODE_ENV=production

# Your MySQL Database (any provider)
DB_HOST=your-mysql-host.com
DB_PORT=3306
DB_NAME=aol_tms
DB_USER=your_username
DB_PASSWORD=your_secure_password
DB_CONNECTION_LIMIT=5

# Security (Generate strong secrets)
JWT_SECRET=your_super_secure_jwt_secret_here
ENCRYPTION_KEY=your_super_secure_encryption_key_here

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

### 3. Deploy to Your Host

#### Option A: Traditional Hosting (cPanel, Shared Hosting)
```bash
# Upload built files
# - Upload 'dist/' folder contents to 'public_html/'
# - Upload 'server/' folder to secure location outside public_html

# Setup database via hosting panel
# - Create MySQL database 'aol_tms'
# - Import 'database/schema.sql' 
# - Import 'database/seeders.sql'

# Configure web server to proxy /api requests to Node.js server
```

#### Option B: VPS/Cloud (DigitalOcean, Linode, AWS, etc.)
```bash
# Setup Node.js server
cd server
npm install --production
node scripts/setup-database.js  # Creates tables and test data
npm start  # or use PM2: pm2 start server.js

# Serve frontend via Nginx/Apache
# Configure reverse proxy for /api routes
```

#### Option C: Platform-as-a-Service (Heroku, Render, Railway)
```bash
# Most platforms auto-detect Node.js and build automatically
# Just configure environment variables in platform dashboard
```

## 🌐 Hosting Provider Examples

### Hostinger
```env
DB_HOST=your-account.mysql.hostinger.com
DB_NAME=u123456789_aol_tms
DB_USER=u123456789_admin
DB_PASSWORD=your_password
```

### DigitalOcean Managed Database
```env
DB_HOST=your-db-do-user-region-0.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=aol_tms
DB_USER=doadmin
DB_PASSWORD=your_password
```

### AWS RDS
```env
DB_HOST=aol-tms.abcdefg.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=aol_tms
DB_USER=admin
DB_PASSWORD=your_password
```

### Google Cloud SQL
```env
DB_HOST=34.123.45.67  # Cloud SQL IP
DB_PORT=3306
DB_NAME=aol_tms
DB_USER=root
DB_PASSWORD=your_password
```

### Azure Database for MySQL
```env
DB_HOST=aol-tms-server.mysql.database.azure.com
DB_PORT=3306
DB_NAME=aol_tms
DB_USER=your_admin@aol-tms-server
DB_PASSWORD=your_password
```

## 🔧 Web Server Configuration

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Serve frontend static files
    root /path/to/dist;
    index index.html;
    
    # Handle frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to Node.js
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Proxy health check
    location /health {
        proxy_pass http://localhost:5000/health;
    }
}
```

### Apache Configuration (.htaccess)
```apache
RewriteEngine On

# Proxy API requests to Node.js server
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
RewriteRule ^health$ http://localhost:5000/health [P,L]

# Handle frontend routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 🗄️ Database Setup

### Manual Database Setup
```sql
-- Create database
CREATE DATABASE aol_tms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Import schema
mysql -u username -p aol_tms < database/schema.sql

-- Import test data
mysql -u username -p aol_tms < database/seeders.sql
```

### Automated Setup (Recommended)
```bash
# Run from server directory
cd server
node scripts/setup-database.js
```

## 🔒 Security Checklist

- [ ] Generate secure JWT_SECRET (32+ characters)
- [ ] Generate secure ENCRYPTION_KEY (32+ characters)
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure firewall to restrict database access
- [ ] Keep server dependencies updated
- [ ] Enable database backups
- [ ] Monitor server logs

## ✅ Test Deployment

### Health Check
Visit: `https://your-domain.com/health`
Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "database": "connected",
  "version": "1.0.0"
}
```

### Test Login
- URL: `https://your-domain.com`
- Email: `admin@alloverlogistics.com`
- Password: `admin123`

## 🔧 Troubleshooting

**Database Connection Failed:**
- Verify DB_HOST, DB_USER, DB_PASSWORD in .env
- Check if MySQL service is running
- Verify firewall/security group settings
- Test connection with MySQL client

**API 404 Errors:**
- Check web server proxy configuration
- Verify Node.js server is running on correct port
- Check server logs for errors

**Frontend Shows Blank Page:**
- Verify build files uploaded correctly
- Check browser console for errors
- Verify web server serves static files correctly

**CORS Errors:**
- Check FRONTEND_URL in server .env
- Verify web server proxy headers
- Update CORS origins in server.js if needed

## 📞 Support

For deployment assistance:
1. Check server logs: `tail -f /path/to/server/logs`
2. Test database: `cd server && npm run validate`
3. Verify configuration: Check .env file settings
4. Monitor health endpoint: `/health`

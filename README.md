# AOL TMS - Transportation Management System

## 🚛 Overview
Enterprise-grade Transportation Management System for All Over Logistics with Zero Trust Security Architecture.

## 📁 Project Structure
```
aol-tms/
├── frontend/          # React + TypeScript Frontend
├── backend/           # Node.js + Express Backend  
├── database/          # MySQL Schema & Migrations
├── docs/             # Documentation & Guides
└── deployment/       # Deployment Scripts & Configs
```

## 🏗️ Architecture
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + JWT Authentication
- **Database**: MySQL with bcrypt password hashing
- **Security**: Zero Trust Architecture with role-based access
- **Deployment**: Hostinger Cloud Starter Package

## 🔐 Zero Trust Security Features
- Multi-factor authentication support
- Role-based access control (RBAC)
- Session management with JWT tokens
- Password hashing with bcrypt (12 rounds)
- API rate limiting
- HTTPS enforcement
- Input validation and sanitization
- Audit logging for all actions

## 👥 User Roles
- **Admin**: Full system access
- **Dispatcher**: Load management and routing
- **Driver**: Mobile access for deliveries
- **Accountant**: Financial and billing access
- **IT Support**: System maintenance access

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MySQL 8.0+ (XAMPP compatible)
- Git

### Local Development Setup
```bash
# Clone and setup
git clone <repository>
cd aol-tms

# Install dependencies
npm run setup

# Configure database (XAMPP)
# 1. Start XAMPP MySQL service
# 2. Create database 'aol_tms'
# 3. Run database setup
npm run db:setup

# Start development servers
npm run dev
```

### Production Deployment (Hostinger)
```bash
# Build application
npm run build

# Deploy to Hostinger
npm run deploy:hostinger
```

## 🗄️ Database Compatibility
- **XAMPP**: Full compatibility for local development
- **Cloud MySQL**: Hostinger, DigitalOcean, AWS RDS
- **Password Hashing**: bcrypt with 12 rounds
- **Migrations**: Automated schema updates

## 📋 Agile Development
- Feature-based development
- Sprint-based releases
- Continuous integration
- Automated testing
- Code review process

## 📞 Support
- Documentation: `/docs`
- Issues: GitHub Issues
- Security: Contact IT team

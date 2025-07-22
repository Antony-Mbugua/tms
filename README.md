# 🚚 AOL Transport Management System - Enterprise Edition

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/aol-tms/enterprise)
[![Security](https://img.shields.io/badge/security-zero--trust-green.svg)](https://docs.aol-tms.com/security)
[![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)](LICENSE)

> **Transform your logistics operations with enterprise-grade security, modular architecture, and comprehensive transport management capabilities.**

## 🎯 Features

### 🔐 Enterprise Security
- **Zero Trust Architecture** with role-based access control
- **Multi-Factor Authentication** (Google Authenticator integration)
- **AES-256 Encryption** for sensitive data fields
- **JWT Token Management** with automatic rotation
- **SIEM Logging** with automated cleanup
- **Security Event Monitoring** and audit trails

### 👥 Role-Based System
- **Admin**: Complete system control, user management, training modules
- **Dispatcher**: Load creation, driver assignment, real-time tracking
- **Driver**: Mobile app access, trip management, document upload
- **Accountant**: Invoice generation, expense tracking, financial reports
- **IT Support**: System monitoring, security logs, maintenance

### 📦 Core TMS Features
- **Load Management**: Create, assign, and track shipments
- **Document Processing**: OCR-powered BOL, POD, and receipt scanning
- **Invoice Generation**: Automated PDF/Excel invoice creation
- **Expense Tracking**: Comprehensive cost monitoring
- **Training System**: Role-based training module access
- **Real-time Chat**: Socket.IO powered communication
- **Credit Management**: Broker credit status and payment tracking

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Node.js + Express.js + MySQL + JWT + bcrypt
- **Mobile**: Flutter (Driver App) - *Coming Soon*
- **Real-time**: Socket.IO for chat and notifications
- **Security**: Zero Trust with MFA, AES-256, SIEM
- **OCR**: Tesseract.js for document processing

### Project Structure
```
aol-tms-enterprise/
├── frontend/                 # React TypeScript Application
│   ├── src/
│   │   ��── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services and utilities
│   │   ├── contexts/        # React contexts
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Helper utilities
│   ├── public/              # Static assets
│   └── dist/                # Built production files
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   ├── uploads/             # File storage
│   └── logs/                # Application logs
├── database/                 # Database schema and migrations
│   ├── schema.sql           # Complete database schema
│   ├── seeders.sql          # Sample data
│   └── migrations/          # Database migrations
├── docs/                     # Documentation
│   ├── api/                 # API documentation
│   ├── deployment/          # Deployment guides
│   └── user-guides/         # User manuals
└── deployment/               # Deployment configurations
    ├── docker/              # Docker configurations
    ├── hostinger/           # Hostinger deployment files
    └── xampp/               # Local development setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- MySQL 8+ (XAMPP for local development)
- Git

### Local Development (XAMPP)
```bash
# Clone repository
git clone <repository-url>
cd aol-tms-enterprise

# Setup environment
npm run setup

# Start XAMPP (Apache + MySQL)
# Create database 'aol_tms' in phpMyAdmin

# Configure backend environment
cd backend
cp .env.example .env
# Edit .env with XAMPP settings

# Setup database
npm run db:setup

# Start development servers
cd ..
npm run dev
```

### Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

### Default Credentials
```
Admin: admin@alloverlogistics.com / admin123
Dispatcher: dispatcher@alloverlogistics.com / admin123
Driver: driver@alloverlogistics.com / admin123
Accountant: accountant@alloverlogistics.com / admin123
IT Support: it@alloverlogistics.com / admin123
```

⚠️ **Change default passwords before production deployment!**

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [API Documentation](docs/api/README.md) - API endpoints and examples
- [Security Guide](docs/security/SECURITY.md) - Security implementation details
- [User Manual](docs/user-guides/USER_MANUAL.md) - End-user documentation

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development servers
npm run build        # Build for production
npm run test         # Run all tests
npm run lint         # Lint code
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
npm run validate     # Validate database connection
```

### Code Standards
- **TypeScript** for type safety
- **ESLint + Prettier** for code formatting
- **Husky + lint-staged** for pre-commit hooks
- **Conventional Commits** for commit messages

## 🚀 Deployment

### Hostinger Cloud Starter
Complete deployment guide available at [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

### Production Checklist
- [ ] Change default passwords
- [ ] Configure SSL certificates
- [ ] Set up database backups
- [ ] Configure monitoring
- [ ] Update security keys
- [ ] Test all features

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Multi-factor authentication support
- Role-based access control (RBAC)
- Session management and timeout

### Data Protection
- AES-256 encryption for sensitive fields
- bcrypt password hashing (12 rounds)
- SQL injection prevention
- XSS protection headers

### Monitoring & Auditing
- Security event logging
- Failed login attempt tracking
- Anomaly detection
- SIEM integration with automated cleanup

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Check XAMPP MySQL service and credentials
2. **Port Conflicts**: Ensure ports 3000 and 5000 are available
3. **Build Errors**: Clear node_modules and reinstall dependencies
4. **Authentication**: Verify JWT secrets and database seeding

See [Troubleshooting Guide](docs/TROUBLESHOOTING.md) for detailed solutions.

## 📞 Support

- **Documentation**: [docs.aol-tms.com](https://docs.aol-tms.com)
- **Issues**: [GitHub Issues](https://github.com/aol-tms/enterprise/issues)
- **Security**: security@aol-tms.com

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ for AOL Transport Management**

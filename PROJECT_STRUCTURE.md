# AOL TMS Project Structure

## 📁 **Monorepo Structure**

```
aol-tms/
├── frontend/                 # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── EnterpriseLoginPage.tsx  # ✨ New Enterprise Login
│   │   │   ├── dashboards/
│   │   │   ├── layout/
│   │   │   ├── settings/
│   │   │   ├── shared/
│   │   │   └── ui/
│   │   ├── contexts/
│   │   ├── services/
│   │   │   └── api.ts          # API service layer
│   │   ├── config/
│   │   │   └── environment.ts  # Environment configuration
│   │   └── types/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                  # Node.js + Express Backend
│   ├── config/
│   │   └── database.js       # Database configuration
│   ├── routes/
│   │   ├── auth.js          # 🔧 Updated for 'password' field
│   │   ├── dashboard.js
│   │   ├── users.js
│   │   └── ...
│   ├── middleware/
│   ├── utils/
│   │   ├── spii.js          # Security utilities
│   │   └── mockDatabase.js  # Development fallback
│   ├── scripts/
│   │   ├── setup-database.js
│   │   └── validate-connection.js
│   ├── database/
│   │   ├── schema.sql       # Database schema
│   │   └── seeders.sql      # Test data
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js
│
├── package.json             # Root package.json (monorepo)
├── DATABASE_SETUP.md        # Database setup guide
├── PROJECT_STRUCTURE.md     # This file
└── README.md
```

## 🚀 **Key Features Implemented**

### 1. **Enterprise-Grade Login UI**
- **Single Truck Icon**: Professional branding with company logo
- **Confetti Animation**: Celebratory confetti poppers on welcome screen
- **Theme Customization**: 8 professional color schemes
- **Responsive Design**: Mobile-first enterprise design
- **Security Features**: Password visibility toggle, remember me, forgot password

### 2. **Database Integration**
- **Updated Schema**: Uses `password` field instead of `password_hash`
- **Hashed Passwords**: Proper bcrypt password hashing
- **Mock Fallback**: Development mode with mock data when MySQL unavailable
- **Local MySQL Support**: Direct integration with `aol_tms` database

### 3. **Modern Architecture**
- **Monorepo Structure**: Separate frontend/backend folders
- **TypeScript**: Full type safety
- **Environment Detection**: Automatic local vs production configuration
- **API Layer**: Clean service architecture

## 🎨 **UI/UX Improvements**

### Enterprise Login Page Features:
- **Professional Branding**: Corporate blue theme with company logo
- **Welcome Animation**: Dynamic confetti poppers with themed colors
- **Single Truck Icon**: Clean, modern truck icon in welcome area
- **Theme Customizer**: 8 color options (Blue, Slate, Emerald, Orange, Purple, Red, Teal, Indigo)
- **Responsive Layout**: Works on all devices
- **Intuitive Flow**: Clear call-to-actions and user guidance

### Technical Enhancements:
- **Canvas Confetti**: Smooth confetti animation using canvas-confetti library
- **Framer Motion**: Smooth page transitions and micro-interactions
- **Enterprise Icons**: Professional icons from Lucide React
- **Backdrop Blur**: Modern glassmorphism effects
- **Gradient Backgrounds**: Dynamic color-themed gradients

## 🛡️ **Security & Authentication**

### Database Schema:
- **Password Field**: `password` column in users table (updated from `password_hash`)
- **Bcrypt Hashing**: 12-round bcrypt for password security
- **JWT Tokens**: Secure authentication tokens
- **Session Management**: Proper session handling

### Test Credentials:
```
Email: admin@alloverlogistics.com
Password: admin123
Role: admin
```

## 🔧 **Development Setup**

### Quick Start:
```bash
# Install dependencies
npm run setup

# Start development servers
npm run dev:full

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Database Setup:
```bash
# Create MySQL database 'aol_tms'
# Run database setup
cd backend && npm run db:setup
```

## 📱 **Enterprise Features**

### Visual Design:
- **Professional Color Palette**: Enterprise-grade color schemes
- **Modern Typography**: Clean, readable fonts
- **Micro-interactions**: Smooth hover effects and transitions
- **Loading States**: Professional loading animations
- **Error Handling**: User-friendly error messages

### User Experience:
- **Intuitive Navigation**: Clear user flow
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Optimized animations and rendering
- **Responsive**: Mobile-first design approach

This structure provides a solid foundation for an enterprise-grade Transportation Management System with modern UI/UX and robust backend integration.

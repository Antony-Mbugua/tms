# AOL TMS - All Over Logistics Transportation Management System

## 🚚 Overview

AOL TMS is a comprehensive, enterprise-grade Transportation Management System built with modern web technologies. It provides a complete solution for logistics companies to manage their fleet, drivers, dispatching, accounting, and training operations.

## ✨ Features

### 🎨 **Modern UI/UX Design**
- **Dark Mode First**: Elegant dark theme with light mode toggle
- **Mobile Responsive**: Fully optimized for all device sizes
- **Glassmorphism Effects**: Modern design language with soft shadows and rounded corners
- **Smooth Animations**: Framer Motion powered transitions and microinteractions
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

### 🔐 **Authentication & Security**
- **Role-Based Access Control**: 5 distinct user roles with tailored permissions
- **Multi-Factor Authentication**: Optional Google Authenticator integration
- **Session Management**: Secure session handling with timeout alerts
- **Zero Trust Architecture**: ZTA principles implementation
- **AES-256 Encryption**: Rotating encryption keys for data security

### 👥 **User Roles & Dashboards**

#### **Admin Dashboard**
- ✅ User management (Create, Read, Update, Delete)
- ✅ Role assignment and permission management
- ✅ Training access control
- ✅ System analytics and fleet overview
- ✅ Access logs and audit trails

#### **Dispatcher Dashboard**
- ✅ Load management and creation
- ✅ Rate confirmation upload
- ✅ Driver and truck assignment
- ✅ Trip scheduling and route planning
- ✅ Document management (BOL, POD)

#### **Driver Dashboard**
- ✅ Trip management and status updates
- ✅ Document upload (POD, receipts, photos)
- ✅ Real-time chat with dispatchers
- ✅ Route information and delivery tracking
- ✅ Earnings and trip history

#### **Accountant Dashboard**
- ✅ Invoice generation and management
- ✅ Expense tracking (fuel, maintenance, tolls)
- ✅ Payment processing (Quick Pay, Zelle, ACH)
- ✅ Financial reports and analytics
- ✅ Customer billing management

#### **IT Support Dashboard**
- ✅ System health monitoring
- ✅ Security event logs (SIEM)
- ✅ User authentication logs
- ✅ Encryption key rotation management
- ✅ Performance metrics and alerts

### 📚 **Training Management**
- **Dynamic Access Control**: Admin-controlled training visibility
- **Multi-Format Support**: PDFs, videos, YouTube links, images
- **Progress Tracking**: Completion status and user analytics
- **Category Organization**: Safety, Operations, Compliance modules
- **Upload Management**: Easy content creation and editing

### 📄 **Document Management**
- **Drag & Drop Upload**: Intuitive file upload interface
- **Multiple Formats**: Support for PDFs, images, and various file types
- **Category Organization**: Organized by type and purpose
- **Version Control**: Track document updates and changes
- **Access Control**: Role-based document visibility

### 📊 **Analytics & Reporting**
- **Revenue Tracking**: Monthly revenue trends and growth metrics
- **Fleet Utilization**: Individual truck performance monitoring
- **Performance KPIs**: On-time delivery, customer satisfaction
- **Interactive Charts**: Visual data representation
- **Export Capabilities**: Data export for external analysis

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** - Modern component-based UI library
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern component library
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Vite** - Fast development build tool

### **Design System**
- **Design Language**: Clean, modern, intuitive
- **Color Scheme**: Dark mode primary with light mode support
- **Typography**: Optimized for readability
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable, accessible UI components

### **Backend Ready**
- **RESTful API**: Designed for Laravel backend integration
- **MySQL Database**: Structured for relational data
- **Authentication**: JWT token based auth support
- **File Upload**: Multi-part form data handling

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd aol-tms

# Install dependencies
npm install

# Start development server
npm start
```

### **Demo Credentials**
```
Admin: admin@aol.com / password123
Dispatcher: dispatcher@aol.com / password123  
Driver: driver@aol.com / password123
```

## 📱 **Responsive Design**

The application is fully responsive and tested across:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+
- **Large Screens**: 1440px+

## 🔒 **Security Features**

- **Authentication**: Secure login with optional MFA
- **Authorization**: Role-based access control (RBAC)
- **Session Security**: Automatic timeout and secure storage
- **Data Encryption**: AES-256 encryption with key rotation
- **SIEM Logging**: Security Information and Event Management
- **Input Validation**: XSS and injection protection
- **HTTPS**: Secure communication protocols

## 🧪 **Testing**

```bash
# Run unit tests
npm test

# Run integration tests  
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 📦 **Build & Deployment**

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 **Roadmap**

### **Phase 1** ✅ **Completed**
- [x] User authentication and role management
- [x] Core dashboard functionality
- [x] Document upload system
- [x] Training management
- [x] Analytics and reporting

### **Phase 2** 🔄 **In Progress**
- [ ] Real-time GPS tracking
- [ ] Mobile app development
- [ ] Advanced reporting
- [ ] API integrations
- [ ] Automated billing

### **Phase 3** 📋 **Planned**
- [ ] Machine learning analytics
- [ ] Predictive maintenance
- [ ] Customer portal
- [ ] Third-party integrations
- [ ] Multi-tenant support

## 🆘 **Support**

For support and questions:
- 📧 Email: support@aol-tms.com
- 📚 Documentation: [docs.aol-tms.com]
- 🐛 Issues: [GitHub Issues]

## 🙏 **Acknowledgments**

- Design inspiration from modern logistics platforms
- Icons by Lucide React
- UI components by Shadcn/UI
- Animation library by Framer Motion

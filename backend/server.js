import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cron from 'node-cron';

// Import configuration
import { testConnection, healthCheck, closeConnection } from './config/database.js';
import { logger } from './utils/logger.js';

// Import middleware
import security from './middleware/security.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import truckRoutes from './routes/trucks.js';
import loadRoutes from './routes/loads.js';
import invoiceRoutes from './routes/invoices.js';
import expenseRoutes from './routes/expenses.js';
import dashboardRoutes from './routes/dashboard.js';
import trainingRoutes from './routes/training.js';
import documentRoutes from './routes/documents.js';
import notificationRoutes from './routes/notifications.js';

// Load environment variables
dotenv.config();

// ES module directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// SECURITY MIDDLEWARE (Zero Trust)
// =============================================

// Basic security headers
app.use(helmet({
  contentSecurityPolicy: process.env.SECURITY_CONTENT_SECURITY_POLICY === 'true',
  hsts: {
    maxAge: parseInt(process.env.SECURITY_HSTS_MAX_AGE) || 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: process.env.SECURITY_FRAMEGUARD || 'deny' }
}));

// Compression for better performance
app.use(compression());

// Maintenance mode check
app.use(security.maintenanceMode);

// Global rate limiting
app.use(security.createRateLimit());

// Progressive delay for repeated requests
app.use(security.speedLimiter);

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// =============================================
// CORS CONFIGURATION
// =============================================

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ];
    
    // Add production domains
    if (process.env.NODE_ENV === 'production') {
      allowedOrigins.push(
        'https://your-domain.com',
        'https://www.your-domain.com'
      );
    }
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining']
};

app.use(cors(corsOptions));

// =============================================
// BODY PARSING & LOGGING
// =============================================

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// =============================================
// STATIC FILES & UPLOADS
// =============================================

// Serve static files securely
app.use('/uploads', express.static(join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  setHeaders: (res, path) => {
    // Security headers for uploaded files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
  }
}));

// =============================================
// HEALTH & MONITORING ENDPOINTS
// =============================================

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    const systemHealth = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '2.0.0',
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbHealth
    };
    
    res.json(systemHealth);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// System info endpoint (admin only)
app.get('/system/info', security.authenticateToken, security.authorizeRole(['admin']), (req, res) => {
  res.json({
    success: true,
    data: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      features: {
        mfa: process.env.MFA_ENABLED === 'true',
        sms: process.env.SMS_ENABLED === 'true',
        email: !!process.env.SMTP_HOST,
        fileUpload: true,
        geolocation: process.env.GEOLOCATION_ENABLED === 'true'
      }
    }
  });
});

// =============================================
// API ROUTES
// =============================================

// API base route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'AOL TMS API v2.0',
    version: process.env.APP_VERSION || '2.0.0',
    documentation: process.env.API_DOCS_ENABLED === 'true' ? `${req.protocol}://${req.get('host')}/api/docs` : null,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      trucks: '/api/trucks',
      loads: '/api/loads',
      invoices: '/api/invoices',
      expenses: '/api/expenses',
      dashboard: '/api/dashboard',
      training: '/api/training',
      documents: '/api/documents',
      notifications: '/api/notifications'
    }
  });
});

// Authentication routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/users', security.authenticateToken, security.validateSession, userRoutes);
app.use('/api/trucks', security.authenticateToken, security.validateSession, truckRoutes);
app.use('/api/loads', security.authenticateToken, security.validateSession, loadRoutes);
app.use('/api/invoices', security.authenticateToken, security.validateSession, invoiceRoutes);
app.use('/api/expenses', security.authenticateToken, security.validateSession, expenseRoutes);
app.use('/api/dashboard', security.authenticateToken, security.validateSession, dashboardRoutes);
app.use('/api/training', security.authenticateToken, security.validateSession, trainingRoutes);
app.use('/api/documents', security.authenticateToken, security.validateSession, documentRoutes);
app.use('/api/notifications', security.authenticateToken, security.validateSession, notificationRoutes);

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  logger.warn('API route not found:', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    method: req.method,
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    error: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  });
});

// =============================================
// SCHEDULED TASKS
// =============================================

// Clean up expired sessions (runs every hour)
cron.schedule('0 * * * *', async () => {
  try {
    const { query } = await import('./config/database.js');
    const result = await query(`
      UPDATE user_sessions 
      SET revoked_at = NOW(), revoked_reason = 'expired' 
      WHERE expires_at < NOW() AND revoked_at IS NULL
    `);
    
    if (result.affectedRows > 0) {
      logger.info(`Cleaned up ${result.affectedRows} expired sessions`);
    }
  } catch (error) {
    logger.error('Session cleanup failed:', error);
  }
});

// Clean up old security events (runs daily at 2 AM)
cron.schedule('0 2 * * *', async () => {
  try {
    const { query } = await import('./config/database.js');
    const result = await query(`
      DELETE FROM security_events 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
    `);
    
    if (result.affectedRows > 0) {
      logger.info(`Cleaned up ${result.affectedRows} old security events`);
    }
  } catch (error) {
    logger.error('Security events cleanup failed:', error);
  }
});

// =============================================
// SERVER STARTUP
// =============================================

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing server gracefully...');
  
  try {
    await closeConnection();
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const server = app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`🚚 AOL TMS Server v${process.env.APP_VERSION || '2.0.0'} running on port ${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
  logger.info(`📋 Health Check: http://localhost:${PORT}/health`);
  
  // Test database connection on startup
  const dbConnected = await testConnection();
  if (dbConnected) {
    logger.info('✅ All systems operational');
  } else {
    logger.warn('⚠️  Server started but database connection failed');
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
  } else {
    logger.error('Server error:', error);
  }
  process.exit(1);
});

export default app;

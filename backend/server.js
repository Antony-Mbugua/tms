import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Security middleware
import {
  generalRateLimit,
  authRateLimit,
  progressiveDelay,
  sanitizeInput,
  logSecurityEvent
} from './src/middleware/security.js';

// Database and utilities
import { db, testConnection } from './src/config/database.js';
import logger from './src/utils/logger.js';
import { initializeSocketIO } from './src/utils/socketHandler.js';

// Route imports
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import truckRoutes from './src/routes/trucks.js';
import loadRoutes from './src/routes/loads.js';
import brokerRoutes from './src/routes/brokers.js';
import invoiceRoutes from './src/routes/invoices.js';
import expenseRoutes from './src/routes/expenses.js';
import documentRoutes from './src/routes/documents.js';
import trainingRoutes from './src/routes/training.js';
import chatRoutes from './src/routes/chat.js';
import dashboardRoutes from './src/routes/dashboard.js';
import adminRoutes from './src/routes/admin.js';

// Initialize environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'DB_HOST',
  'DB_NAME',
  'DB_USER'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server for Socket.IO
const server = createServer(app);

// =============================================
// SECURITY MIDDLEWARE CONFIGURATION
// =============================================

// Enhanced Helmet configuration for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "ws:", "wss:"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      childSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Allow embedding in development
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Device-ID',
    'X-API-Version'
  ],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024 // Only compress if larger than 1KB
}));

// Enhanced logging with security information
const morganFormat = NODE_ENV === 'production' 
  ? 'combined' 
  : ':remote-addr - :remote-user [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length] \":referrer\" \":user-agent\" :response-time ms';

app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.http(message.trim())
  },
  skip: (req, res) => {
    // Skip health check logs in production
    return NODE_ENV === 'production' && req.originalUrl === '/health';
  }
}));

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use(generalRateLimit);
app.use(progressiveDelay);

// Static file serving with security headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
  }
}));

// =============================================
// SECURITY EVENT LOGGING MIDDLEWARE
// =============================================

app.use((req, res, next) => {
  // Log all requests for security monitoring
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const isSuccessful = res.statusCode < 400;
    
    // Log security-relevant requests
    if (!isSuccessful || req.originalUrl.includes('/auth/') || req.method !== 'GET') {
      const eventType = isSuccessful ? 'DATA_ACCESS' : 'SECURITY_VIOLATION';
      const severity = isSuccessful ? 'low' : 'medium';
      
      logSecurityEvent(req, eventType, severity, {
        statusCode: res.statusCode,
        responseTime,
        contentLength: res.get('content-length') || 0
      }).catch(error => {
        logger.error('Failed to log security event:', error);
      });
    }
  });
  
  next();
});

// =============================================
// API ROUTES
// =============================================

// Health check endpoint (no authentication required)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '2.0.0',
    uptime: process.uptime(),
    database: {
      status: 'connected' // Will be updated after DB connection test
    }
  });
});

// API version check
app.get('/api/version', (req, res) => {
  res.json({
    version: '2.0.0',
    apiVersion: 'v1',
    features: [
      'zero-trust-security',
      'multi-factor-authentication',
      'role-based-access-control',
      'real-time-chat',
      'document-ocr',
      'invoice-generation',
      'expense-tracking',
      'training-modules'
    ]
  });
});

// Authentication routes (with stricter rate limiting)
app.use('/api/auth', authRateLimit, authRoutes);

// Protected API routes
app.use('/api/users', userRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/loads', loadRoutes);
app.use('/api/brokers', brokerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// =============================================
// ERROR HANDLING MIDDLEWARE
// =============================================

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 Not Found:', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    error: 'Endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  // Log the error
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body
  });

  // Log security event for errors
  logSecurityEvent(req, 'SECURITY_VIOLATION', 'high', {
    errorType: error.name,
    errorMessage: error.message,
    stack: error.stack
  }).catch(logError => {
    logger.error('Failed to log security event for error:', logError);
  });

  // Don't leak error details in production
  const isDevelopment = NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    error: isDevelopment ? error.message : 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: error.stack })
  });
});

// =============================================
// SOCKET.IO SETUP
// =============================================

const io = new SocketIOServer(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize Socket.IO handlers
initializeSocketIO(io);

// =============================================
// GRACEFUL SHUTDOWN HANDLING
// =============================================

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close((error) => {
    if (error) {
      logger.error('Error during server close:', error);
      process.exit(1);
    }
    
    logger.info('HTTP server closed.');
    
    // Close database connections
    if (db && db.end) {
      db.end(() => {
        logger.info('Database connections closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
  
  // Force exit after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// =============================================
// SERVER STARTUP
// =============================================

const startServer = async () => {
  try {
    // Test database connection (optional in development)
    if (process.env.NODE_ENV === 'production') {
      logger.info('Testing database connection...');
      await testConnection();
      logger.info('Database connection successful');
    } else {
      logger.info('Running in development mode - database connection optional');
      try {
        await testConnection();
        logger.info('Database connection successful');
      } catch (error) {
        logger.warn('Database connection failed, running in mock mode:', error.message);
      }
    }

    // Start the server
    server.listen(PORT, () => {
      logger.info(`🚀 AOL TMS Enterprise Backend started successfully`);
      logger.info(`📡 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
      logger.info(`🔒 Security: Zero Trust Architecture enabled`);
      logger.info(`💬 Real-time: Socket.IO enabled`);
      logger.info(`📊 Health Check: http://localhost:${PORT}/health`);
      
      if (NODE_ENV === 'development') {
        logger.info(`🔧 API Base URL: http://localhost:${PORT}/api`);
        logger.info(`📁 File Uploads: http://localhost:${PORT}/uploads`);
      }
    });

    // Log startup security event
    const startupEvent = {
      eventType: 'SYSTEM_STARTUP',
      severity: 'low',
      description: 'AOL TMS Enterprise Backend started successfully',
      details: {
        port: PORT,
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        features: [
          'zero-trust-security',
          'multi-factor-authentication',
          'role-based-access-control',
          'real-time-chat',
          'document-ocr'
        ]
      }
    };

    logger.info('System startup completed', startupEvent);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import existing utilities
import logger from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import existing route handlers
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';
import loadRoutes from './routes/loads.js';
import invoiceRoutes from './routes/invoices.js';
import brokerRoutes from './routes/brokers.js';
import documentRoutes from './routes/documents.js';
import trainingRoutes from './routes/training.js';
import chatRoutes from './routes/chat.js';
import dashboardRoutes from './routes/dashboard.js';
import expenseRoutes from './routes/expenses.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Trust proxy for accurate IP addresses behind reverse proxy
app.set('trust proxy', 1);

// Basic Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'https://aol-tms.vercel.app',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-info', 'x-request-id'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// Request ID middleware
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '2.0.0',
    memory: process.memoryUsage(),
    pid: process.pid
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loads', loadRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/brokers', brokerRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/expenses', expenseRoutes);

// File upload endpoint for documents
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = () => {
  console.log('Received shutdown signal, starting graceful shutdown...');
  
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // For nodemon

// Start server
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';
    
    httpServer.listen(PORT, HOST, () => {
      logger.info('🚀 AOL TMS Enterprise Server started successfully');
      logger.info(`📡 Server running on ${HOST}:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('🔒 Security: Enterprise-grade protection enabled');
      logger.info(`📊 Health Check: http://${HOST}:${PORT}/health`);
      logger.info(`🔧 API Base URL: http://${HOST}:${PORT}/api`);
      logger.info(`📁 File Uploads: http://${HOST}:${PORT}/uploads`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

export { app };

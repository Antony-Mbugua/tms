import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    security: 5
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'cyan',
    security: 'blue'
  }
};

// Add colors to winston
winston.addColors(customLevels.colors);

// Custom format for logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      logMessage += `\nStack: ${stack}`;
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    if (stack && process.env.NODE_ENV === 'development') {
      logMessage += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0 && process.env.NODE_ENV === 'development') {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// File transport configurations
const fileTransports = [
  // Combined logs (all levels)
  new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'debug',
    format: logFormat,
    handleExceptions: true,
    handleRejections: true
  }),
  
  // Error logs only
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '90d',
    level: 'error',
    format: logFormat,
    handleExceptions: true,
    handleRejections: true
  }),
  
  // Security logs (separate file for SIEM integration)
  new DailyRotateFile({
    filename: path.join(logsDir, 'security-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '50m',
    maxFiles: '365d',
    level: 'security',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          '@timestamp': timestamp,
          level,
          message,
          source: 'aol-tms-backend',
          environment: process.env.NODE_ENV || 'development',
          ...meta
        });
      })
    )
  }),
  
  // HTTP access logs
  new DailyRotateFile({
    filename: path.join(logsDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '50m',
    maxFiles: '30d',
    level: 'http',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, message }) => {
        return `${timestamp} ${message}`;
      })
    )
  })
];

// Console transport for development
const consoleTransport = new winston.transports.Console({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: consoleFormat,
  handleExceptions: true,
  handleRejections: true
});

// Create logger instance
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: {
    service: 'aol-tms-backend',
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    hostname: process.env.HOSTNAME || 'localhost',
    pid: process.pid
  },
  transports: [
    consoleTransport,
    ...fileTransports
  ],
  exitOnError: false
});

// Add security logging method
logger.security = (message, meta = {}) => {
  logger.log('security', message, {
    ...meta,
    timestamp: new Date().toISOString(),
    securityEvent: true
  });
};

// Add critical logging method
logger.critical = (message, meta = {}) => {
  logger.error(message, {
    ...meta,
    critical: true,
    timestamp: new Date().toISOString()
  });
  
  // In production, you might want to send alerts here
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with alerting system (email, Slack, etc.)
    console.error(`CRITICAL: ${message}`, meta);
  }
};

// Performance logging
logger.performance = (operation, startTime, meta = {}) => {
  const duration = Date.now() - startTime;
  const level = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
  
  logger.log(level, `Performance: ${operation} completed`, {
    ...meta,
    duration: `${duration}ms`,
    performance: true
  });
};

// Database query logging
logger.query = (query, duration, meta = {}) => {
  const level = duration > 1000 ? 'warn' : 'debug';
  
  logger.log(level, 'Database query executed', {
    ...meta,
    query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
    duration: `${duration}ms`,
    queryLog: true
  });
};

// Audit logging for compliance
logger.audit = (action, user, resource, outcome, meta = {}) => {
  logger.security(`Audit: ${action}`, {
    ...meta,
    audit: true,
    action,
    user: typeof user === 'object' ? user.id || user.email : user,
    resource,
    outcome,
    timestamp: new Date().toISOString()
  });
};

// Authentication event logging
logger.auth = (event, user, success = true, meta = {}) => {
  const level = success ? 'info' : 'warn';
  
  logger.log(level, `Auth: ${event}`, {
    ...meta,
    auth: true,
    event,
    user: typeof user === 'object' ? user.id || user.email : user,
    success,
    timestamp: new Date().toISOString()
  });
};

// Business logic logging
logger.business = (operation, data, meta = {}) => {
  logger.info(`Business: ${operation}`, {
    ...meta,
    business: true,
    operation,
    data: typeof data === 'object' ? JSON.stringify(data) : data,
    timestamp: new Date().toISOString()
  });
};

// Structured error logging
logger.logError = (error, context = {}) => {
  const errorDetails = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    errno: error.errno,
    sqlState: error.sqlState,
    ...context,
    timestamp: new Date().toISOString()
  };
  
  logger.error('Application error occurred', errorDetails);
  
  return errorDetails;
};

// Log system metrics
logger.metrics = (metrics) => {
  logger.info('System metrics', {
    ...metrics,
    metrics: true,
    timestamp: new Date().toISOString()
  });
};

// Log health check results
logger.health = (component, status, details = {}) => {
  const level = status === 'healthy' ? 'info' : 'error';
  
  logger.log(level, `Health Check: ${component}`, {
    component,
    status,
    ...details,
    healthCheck: true,
    timestamp: new Date().toISOString()
  });
};

// Create child logger for specific modules
logger.child = (defaultMeta) => {
  return winston.createLogger({
    levels: customLevels.levels,
    level: logger.level,
    format: logger.format,
    defaultMeta: {
      ...logger.defaultMeta,
      ...defaultMeta
    },
    transports: logger.transports
  });
};

// Handle uncaught exceptions and rejections
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'exceptions.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
);

logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'rejections.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
);

// Clean up old log files (called by cron job)
logger.cleanup = () => {
  try {
    const files = fs.readdirSync(logsDir);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < thirtyDaysAgo && file.includes('combined-')) {
        fs.unlinkSync(filePath);
        logger.info(`Cleaned up old log file: ${file}`);
      }
    });
  } catch (error) {
    logger.error('Failed to cleanup old log files:', error);
  }
};

// Export logger with additional methods
export default logger;

// Named exports for specific use cases
export {
  logger,
  customLevels,
  logsDir
};

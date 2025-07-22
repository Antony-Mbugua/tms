import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// Database configuration with XAMPP compatibility
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Empty for XAMPP default
  database: process.env.DB_NAME || 'aol_tms',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  acquireTimeout: parseInt(process.env.DB_TIMEOUT) || 60000,
  timeout: parseInt(process.env.DB_TIMEOUT) || 60000,
  charset: 'utf8mb4',
  timezone: '+00:00',
  // Security settings
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Adjust based on your SSL setup
  } : false,
  // Performance optimizations
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false,
  debug: process.env.NODE_ENV === 'development' && process.env.DEBUG_MODE === 'true'
};

// Create connection pool for better performance
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('✅ Database connected successfully', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user
    });
    
    // Test basic query
    await connection.execute('SELECT 1 as test');
    connection.release();
    
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', {
      error: error.message,
      code: error.code,
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database
    });
    
    // Provide helpful error messages for common issues
    if (error.code === 'ECONNREFUSED') {
      logger.error('💡 Troubleshooting tips:');
      logger.error('   1. Make sure MySQL is running (XAMPP Control Panel → Start MySQL)');
      logger.error('   2. Check if port 3306 is available');
      logger.error('   3. Verify DB_HOST in .env file');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      logger.error('💡 Troubleshooting tips:');
      logger.error('   1. Check DB_USER and DB_PASSWORD in .env file');
      logger.error('   2. For XAMPP, password is usually empty (DB_PASSWORD=)');
      logger.error('   3. Verify MySQL user permissions');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      logger.error('💡 Troubleshooting tips:');
      logger.error('   1. Database does not exist');
      logger.error('   2. Create database in phpMyAdmin or MySQL');
      logger.error('   3. Run: npm run db:setup');
    }
    
    // Don't exit in development to allow for database setup
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    
    return false;
  }
};

// Enhanced query function with error handling and logging
export const query = async (sql, params = []) => {
  const startTime = Date.now();
  
  try {
    const [results] = await pool.execute(sql, params);
    
    const executionTime = Date.now() - startTime;
    
    // Log slow queries
    if (executionTime > 1000) {
      logger.warn('Slow query detected:', {
        sql: sql.substring(0, 100) + '...',
        executionTime: `${executionTime}ms`,
        params: params.slice(0, 3) // Only log first 3 params for security
      });
    }
    
    // Log in debug mode
    if (process.env.DEBUG_MODE === 'true') {
      logger.debug('Database query executed:', {
        sql: sql.substring(0, 200) + '...',
        paramCount: params.length,
        executionTime: `${executionTime}ms`,
        resultCount: Array.isArray(results) ? results.length : 1
      });
    }
    
    return results;
  } catch (error) {
    logger.error('Database query error:', {
      error: error.message,
      code: error.code,
      sql: sql.substring(0, 100) + '...',
      params: params.slice(0, 3) // Only log first 3 params for security
    });
    
    // Provide user-friendly error messages
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error('Database table not found. Please run database setup: npm run db:setup');
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
      throw new Error('Database column not found. Please run database migration: npm run db:migrate');
    }
    
    throw error;
  }
};

// Transaction helper for complex operations
export const transaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    logger.error('Transaction rolled back:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const [result] = await pool.execute('SELECT 1 as health, NOW() as timestamp');
    return {
      status: 'healthy',
      timestamp: result[0].timestamp,
      pool: {
        total: pool.pool._allConnections.length,
        free: pool.pool._freeConnections.length,
        used: pool.pool._allConnections.length - pool.pool._freeConnections.length
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Graceful shutdown
export const closeConnection = async () => {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

// Initialize database connection test
testConnection();

// Export pool for direct access if needed
export { pool };
export default { query, transaction, healthCheck, closeConnection, testConnection };

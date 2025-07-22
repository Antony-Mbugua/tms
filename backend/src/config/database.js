import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aol_tms',
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  connectionLimit: 100,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  multipleStatements: false,
  namedPlaceholders: true
};

// Connection pool configuration
const poolConfig = {
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
  acquireTimeout: 60000,
  timeout: 60000,
  idleTimeout: 300000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
let pool;
let isConnected = false;

const createPool = () => {
  try {
    pool = mysql.createPool(poolConfig);
    
    // Handle pool events
    pool.on('connection', (connection) => {
      logger.info(`Database connection established: ${connection.threadId}`);
      isConnected = true;
    });

    pool.on('error', (error) => {
      logger.error('Database pool error:', error);
      isConnected = false;
      
      if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        logger.warn('Database connection lost, attempting to reconnect...');
        setTimeout(createPool, 5000);
      }
    });

    pool.on('acquire', (connection) => {
      logger.debug(`Database connection acquired: ${connection.threadId}`);
    });

    pool.on('release', (connection) => {
      logger.debug(`Database connection released: ${connection.threadId}`);
    });

    logger.info('Database pool created successfully');
    return pool;
  } catch (error) {
    logger.error('Failed to create database pool:', error);
    throw error;
  }
};

// Initialize the pool
createPool();

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Test basic query
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
    
    // Test database exists
    const [dbRows] = await connection.execute(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [dbConfig.database]
    );
    
    if (dbRows.length === 0) {
      throw new Error(`Database '${dbConfig.database}' does not exist`);
    }
    
    // Test if tables exist
    const [tableRows] = await connection.execute(`
      SELECT COUNT(*) as table_count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [dbConfig.database]);
    
    const tablesExist = tableRows[0].table_count > 0;
    
    connection.release();
    
    logger.info('Database connection test successful', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      tablesExist,
      timestamp: rows[0].timestamp
    });
    
    isConnected = true;
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    isConnected = false;
    throw error;
  }
};

// Get database connection
export const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    logger.error('Failed to get database connection:', error);
    throw error;
  }
};

// Execute query with error handling and logging
export const executeQuery = async (query, params = []) => {
  const startTime = Date.now();
  let connection;
  
  try {
    connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(query, params);
    
    const executionTime = Date.now() - startTime;
    
    // Log slow queries (> 1 second)
    if (executionTime > 1000) {
      logger.warn('Slow query detected', {
        query: query.substring(0, 100),
        executionTime,
        paramCount: params.length
      });
    }
    
    logger.debug('Query executed successfully', {
      query: query.substring(0, 50),
      executionTime,
      rowCount: Array.isArray(rows) ? rows.length : 'N/A'
    });
    
    return [rows, fields];
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    logger.error('Query execution failed', {
      error: error.message,
      query: query.substring(0, 100),
      executionTime,
      sqlState: error.sqlState,
      errno: error.errno
    });
    
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Transaction wrapper
export const executeTransaction = async (callback) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const result = await callback(connection);
    
    await connection.commit();
    logger.debug('Transaction committed successfully');
    
    return result;
  } catch (error) {
    await connection.rollback();
    logger.error('Transaction rolled back due to error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// Database health check
export const checkHealth = async () => {
  try {
    const startTime = Date.now();
    const [rows] = await executeQuery('SELECT 1 as health_check, NOW() as timestamp');
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
      timestamp: rows[0].timestamp,
      connectionPool: {
        total: pool.pool._allConnections.length,
        free: pool.pool._freeConnections.length,
        used: pool.pool._allConnections.length - pool.pool._freeConnections.length
      }
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Get database statistics
export const getDatabaseStats = async () => {
  try {
    const queries = [
      // Table sizes
      `SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size_MB'
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? 
       ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC`,
      
      // Database size
      `SELECT 
        ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Database_Size_MB'
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ?`,
      
      // Connection count
      `SHOW STATUS LIKE 'Threads_connected'`,
      
      // Uptime
      `SHOW STATUS LIKE 'Uptime'`
    ];
    
    const [tableStats] = await executeQuery(queries[0], [dbConfig.database]);
    const [sizeStats] = await executeQuery(queries[1], [dbConfig.database]);
    const [connectionStats] = await executeQuery(queries[2]);
    const [uptimeStats] = await executeQuery(queries[3]);
    
    return {
      tables: tableStats,
      totalSize: sizeStats[0]?.Database_Size_MB || 0,
      connections: parseInt(connectionStats[0]?.Value || 0),
      uptime: parseInt(uptimeStats[0]?.Value || 0),
      poolStats: {
        total: pool.pool._allConnections.length,
        free: pool.pool._freeConnections.length,
        used: pool.pool._allConnections.length - pool.pool._freeConnections.length
      }
    };
  } catch (error) {
    logger.error('Failed to get database statistics:', error);
    throw error;
  }
};

// Cleanup old records (for SIEM and session management)
export const cleanupOldRecords = async () => {
  try {
    const cleanupQueries = [
      // Clean up old security events (keep last 90 days for low/medium, 365 days for high/critical)
      `DELETE FROM security_events 
       WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY) 
       AND severity IN ('low', 'medium')`,
      
      `DELETE FROM security_events 
       WHERE created_at < DATE_SUB(NOW(), INTERVAL 365 DAY) 
       AND severity IN ('high', 'critical')`,
      
      // Clean up expired sessions
      `DELETE FROM user_sessions 
       WHERE expires_at < NOW() OR 
       (is_active = FALSE AND last_activity < DATE_SUB(NOW(), INTERVAL 7 DAY))`,
      
      // Clean up old load status history (keep last 2 years)
      `DELETE FROM load_status_history 
       WHERE occurred_at < DATE_SUB(NOW(), INTERVAL 2 YEAR)`,
      
      // Clean up old chat messages (keep last 1 year)
      `DELETE FROM chat_messages 
       WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR) 
       AND is_pinned = FALSE`
    ];
    
    let totalCleaned = 0;
    
    for (const query of cleanupQueries) {
      const [result] = await executeQuery(query);
      const affectedRows = result.affectedRows || 0;
      totalCleaned += affectedRows;
      
      if (affectedRows > 0) {
        logger.info(`Cleanup: ${affectedRows} records removed`);
      }
    }
    
    logger.info(`Database cleanup completed: ${totalCleaned} total records removed`);
    return totalCleaned;
  } catch (error) {
    logger.error('Database cleanup failed:', error);
    throw error;
  }
};

// Setup database indexes for performance
export const setupIndexes = async () => {
  try {
    const indexes = [
      // Security events indexes
      'CREATE INDEX IF NOT EXISTS idx_security_events_user_date ON security_events(user_id, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_security_events_type_severity ON security_events(event_type, severity)',
      'CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address)',
      
      // User sessions indexes
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active, expires_at)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_fingerprint ON user_sessions(device_fingerprint)',
      
      // Loads indexes for performance
      'CREATE INDEX IF NOT EXISTS idx_loads_status_date ON loads(status, pickup_date)',
      'CREATE INDEX IF NOT EXISTS idx_loads_driver_date ON loads(driver_id, pickup_date)',
      'CREATE INDEX IF NOT EXISTS idx_loads_broker_date ON loads(broker_id, pickup_date)',
      
      // Chat messages indexes
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_room_date ON chat_messages(room_id, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_user_date ON chat_messages(user_id, created_at)',
      
      // Training progress indexes
      'CREATE INDEX IF NOT EXISTS idx_training_progress_user_status ON training_progress(user_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_training_progress_module_status ON training_progress(module_id, status)'
    ];
    
    for (const indexQuery of indexes) {
      await executeQuery(indexQuery);
    }
    
    logger.info('Database indexes setup completed');
  } catch (error) {
    logger.error('Failed to setup database indexes:', error);
    throw error;
  }
};

// Initialize database optimizations
export const initializeDatabase = async () => {
  try {
    await testConnection();
    await setupIndexes();
    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

// Graceful shutdown
export const closeDatabase = async () => {
  try {
    if (pool) {
      await pool.end();
      logger.info('Database pool closed successfully');
    }
  } catch (error) {
    logger.error('Error closing database pool:', error);
    throw error;
  }
};

// Export the pool as default export for backward compatibility
export const db = pool;

export default {
  db: pool,
  testConnection,
  getConnection,
  executeQuery,
  executeTransaction,
  checkHealth,
  getDatabaseStats,
  cleanupOldRecords,
  setupIndexes,
  initializeDatabase,
  closeDatabase,
  isConnected: () => isConnected
};

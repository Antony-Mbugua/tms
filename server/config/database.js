import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aol_tms',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection (non-blocking in development)
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔧 Server will continue running without database connection');
    console.log('💡 To fix: Start XAMPP MySQL service or check database configuration');

    // Only exit in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Initialize database connection
testConnection();

// Helper function to execute queries
export const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);

    // In development, provide helpful error message
    if (process.env.NODE_ENV === 'development' && error.code === 'ECONNREFUSED') {
      throw new Error('Database not available. Please start XAMPP MySQL service.');
    }

    throw error;
  }
};

// Helper function for transactions
export const transaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;

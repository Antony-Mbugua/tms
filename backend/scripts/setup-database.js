import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupDatabase = async () => {
  let connection;
  
  try {
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password'
    });

    console.log('📦 Setting up AOL TMS Database...');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by statements and execute each one
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('✅ Database schema created successfully');

    // Read and execute seeders
    const seedersPath = path.join(__dirname, '..', '..', 'database', 'seeders.sql');
    const seeders = fs.readFileSync(seedersPath, 'utf8');
    
    const seedStatements = seeders.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of seedStatements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('✅ Database seeded with test data successfully');
    console.log('');
    console.log('🔐 Test User Credentials:');
    console.log('  Admin: admin@aol.com / password123');
    console.log('  Dispatcher: dispatcher@aol.com / password123');
    console.log('  Driver: driver@aol.com / password123');
    console.log('  Accountant: accountant@aol.com / password123');
    console.log('  IT Support: it@aol.com / password123');
    console.log('');
    console.log('🚀 Database setup complete!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

setupDatabase();

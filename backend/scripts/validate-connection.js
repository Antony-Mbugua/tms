import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function validateDatabaseConnection() {
  log('\n🔍 Validating Database Connection...', colors.bold);
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aol_tms'
  };

  log(`\n📋 Configuration:`, colors.blue);
  log(`   Host: ${config.host}`);
  log(`   Port: ${config.port}`);
  log(`   Database: ${config.database}`);
  log(`   User: ${config.user}`);
  log(`   Password: ${config.password ? '***' : '(empty)'}`);

  try {
    // Test connection
    const connection = await mysql.createConnection(config);
    log('\n✅ Database connection successful!', colors.green);

    // Test database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === config.database);
    
    if (dbExists) {
      log(`✅ Database '${config.database}' exists`, colors.green);
    } else {
      log(`❌ Database '${config.database}' does not exist`, colors.red);
      await connection.end();
      return false;
    }

    // Test tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    const tableCount = tables.length;
    
    if (tableCount > 0) {
      log(`✅ Found ${tableCount} tables in database`, colors.green);
      
      // List tables
      log('\n📊 Tables:', colors.blue);
      tables.forEach(table => {
        const tableName = table[`Tables_in_${config.database}`];
        log(`   - ${tableName}`);
      });

      // Test users table with sample data
      try {
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const userCount = users[0].count;
        log(`✅ Users table has ${userCount} records`, colors.green);
      } catch (error) {
        log(`❌ Error accessing users table: ${error.message}`, colors.red);
      }

    } else {
      log(`⚠️  No tables found in database (run: npm run db:setup)`, colors.yellow);
    }

    await connection.end();
    return true;

  } catch (error) {
    log(`\n❌ Database connection failed:`, colors.red);
    log(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      log('\n💡 Troubleshooting:', colors.yellow);
      log('   1. Make sure MySQL is running (XAMPP Control Panel)');
      log('   2. Check if port 3306 is available');
      log('   3. Verify DB_HOST in .env file');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      log('\n💡 Troubleshooting:', colors.yellow);
      log('   1. Check DB_USER and DB_PASSWORD in .env file');
      log('   2. For XAMPP, password is usually empty');
      log('   3. Verify MySQL user permissions');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      log('\n💡 Troubleshooting:', colors.yellow);
      log('   1. Database does not exist');
      log('   2. Create database in phpMyAdmin or MySQL');
      log('   3. Run: npm run db:setup');
    }
    
    return false;
  }
}

async function validateEnvironment() {
  log('\n🔍 Validating Environment Configuration...', colors.bold);
  
  const requiredVars = [
    'DB_HOST',
    'DB_PORT', 
    'DB_NAME',
    'DB_USER',
    'JWT_SECRET'
  ];

  let allValid = true;

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value !== undefined) {
      log(`✅ ${varName}: ${varName.includes('SECRET') || varName.includes('PASSWORD') ? '***' : value}`, colors.green);
    } else {
      log(`❌ ${varName}: NOT SET`, colors.red);
      allValid = false;
    }
  });

  // Special check for empty password (common in XAMPP)
  if (process.env.DB_PASSWORD === '') {
    log(`✅ DB_PASSWORD: (empty - OK for XAMPP)`, colors.green);
  }

  log(`\n📍 Environment: ${process.env.NODE_ENV || 'development'}`);

  return allValid;
}

async function validateServerHealth() {
  log('\n🔍 Testing Server Health...', colors.bold);
  
  try {
    const response = await fetch('http://localhost:5000/health');
    
    if (response.ok) {
      const data = await response.json();
      log('✅ Server health check passed', colors.green);
      log(`   Status: ${data.status}`);
      log(`   Environment: ${data.environment}`);
      log(`   Database: ${data.database}`);
      log(`   Version: ${data.version}`);
      return true;
    } else {
      log(`❌ Server health check failed: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Cannot reach server: ${error.message}`, colors.red);
    log('\n💡 Make sure the server is running:', colors.yellow);
    log('   npm run server');
    return false;
  }
}

async function main() {
  log(`${colors.bold}${colors.blue}
  ╔══════════════════════════════════════════════════════════════╗
  ║                    AOL TMS Connection Validator              ║
  ╚══════════════════════════════════════════════════════════════╝
  ${colors.reset}`);

  let allValid = true;

  // Validate environment
  const envValid = await validateEnvironment();
  allValid = allValid && envValid;

  // Validate database
  const dbValid = await validateDatabaseConnection();
  allValid = allValid && dbValid;

  // Validate server (if running)
  const serverValid = await validateServerHealth();
  // Note: Server might not be running during setup, so don't fail validation

  log('\n' + '='.repeat(60));
  
  if (allValid) {
    log('🎉 All validations passed! System is ready.', colors.green + colors.bold);
    log('\n🚀 Next steps:', colors.blue);
    log('   1. Start the development servers: npm run dev:full');
    log('   2. Open http://localhost:3000');
    log('   3. Login with test credentials from DEPLOYMENT_GUIDE.md');
  } else {
    log('❌ Some validations failed. Please fix the issues above.', colors.red + colors.bold);
    log('\n📖 For help, check:', colors.yellow);
    log('   - DEPLOYMENT_GUIDE.md');
    log('   - LOCAL_SETUP.md');
    log('   - server/.env.example');
  }

  log('');
}

// Run validation
main().catch(console.error);

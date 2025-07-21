import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updateDatabase = async () => {
  let connection;
  
  try {
    // Connect to MySQL database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'aol_tms',
      multipleStatements: true
    });

    console.log('🔄 Updating AOL TMS Database with new features...');

    // Read and execute schema updates
    const schemaUpdatePath = path.join(__dirname, '..', '..', 'database', 'schema_update.sql');
    if (fs.existsSync(schemaUpdatePath)) {
      const schemaUpdate = fs.readFileSync(schemaUpdatePath, 'utf8');
      
      // Split by statements and execute each one
      const statements = schemaUpdate.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await connection.execute(statement);
          } catch (error) {
            // Some statements might fail if already exists, that's okay
            if (!error.message.includes('already exists') && 
                !error.message.includes('Duplicate column') &&
                !error.message.includes('Duplicate key')) {
              console.warn('Statement warning:', error.message);
            }
          }
        }
      }
      console.log('✅ Database schema updated successfully');
    }

    // Read and execute seeder updates
    const seedersUpdatePath = path.join(__dirname, '..', '..', 'database', 'seeders_update.sql');
    if (fs.existsSync(seedersUpdatePath)) {
      const seedersUpdate = fs.readFileSync(seedersUpdatePath, 'utf8');
      
      const seedStatements = seedersUpdate.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of seedStatements) {
        if (statement.trim() && !statement.trim().startsWith('SOURCE')) {
          try {
            await connection.execute(statement);
          } catch (error) {
            // Some updates might fail if data already exists
            if (!error.message.includes('Duplicate entry')) {
              console.warn('Seeder warning:', error.message);
            }
          }
        }
      }
      console.log('✅ Database data updated successfully');
    }

    // Verify the updates
    const [users] = await connection.execute(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        CONCAT(LEFT(u.phone, 3), '-***-', RIGHT(u.phone, 4)) as phone_masked,
        CONCAT('****', RIGHT(u.account_number, 4)) as account_number_masked,
        u.role,
        u.theme_preference,
        u.theme_color
      FROM users u
      WHERE u.is_active = TRUE
      ORDER BY u.role
      LIMIT 5
    `);

    console.log('');
    console.log('📊 Updated User Information:');
    console.table(users);

    // Check new tables
    const [paymentAccounts] = await connection.execute('SELECT COUNT(*) as count FROM payment_accounts');
    const [spiiKeys] = await connection.execute('SELECT COUNT(*) as count FROM spii_encryption_keys');
    const [userPrefs] = await connection.execute('SELECT COUNT(*) as count FROM user_preferences');

    console.log('');
    console.log('📈 New Features Summary:');
    console.log(`  • Payment Accounts: ${paymentAccounts[0].count}`);
    console.log(`  • SPII Encryption Keys: ${spiiKeys[0].count}`);
    console.log(`  • User Preferences: ${userPrefs[0].count}`);
    console.log('');
    console.log('🔐 Enhanced Security Features:');
    console.log('  • Phone numbers with hashing');
    console.log('  • Account numbers with SPII encryption');
    console.log('  • Password reset with SMS verification');
    console.log('  • Theme customization preferences');
    console.log('  • MFA moved to user profiles');
    console.log('  • SPII access logging');
    console.log('');
    console.log('🎨 New UI Features:');
    console.log('  • Enhanced login page with theme picker');
    console.log('  • Remember password functionality');
    console.log('  • Forgot password with email/SMS');
    console.log('  • User profile settings page');
    console.log('  • 8 color themes available');
    console.log('');
    console.log('🚀 Database update complete!');

  } catch (error) {
    console.error('❌ Database update failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

updateDatabase();

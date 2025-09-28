// Debug database schema
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

async function debugDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'requests'
      );
    `);

    console.log('📋 Table exists:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Get table schema
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'requests'
        ORDER BY ordinal_position;
      `);

      console.log('📊 Table schema:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : ''} ${col.column_default ? `(default: ${col.column_default})` : ''}`);
      });

      // Check data
      const data = await client.query('SELECT COUNT(*) as count FROM requests');
      console.log(`📈 Records count: ${data.rows[0].count}`);
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
  }
}

debugDatabase();
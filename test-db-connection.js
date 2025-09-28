// Simple database connection test
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!');

    const result = await client.query('SELECT NOW() as current_time');
    console.log('🕒 Database time:', result.rows[0].current_time);

    await client.end();
    console.log('🔌 Disconnected successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testConnection();
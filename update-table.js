require('dotenv').config();
const { Client } = require('pg');

async function updateTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Add status column if it doesn't exist
    console.log('Updating table schema...');
    await client.query(`
      ALTER TABLE requests
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS admin_comment TEXT,
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS reviewed_by TEXT
    `);

    console.log('✅ Table updated successfully!');

    // Test fetching requests
    console.log('Testing fetch requests...');
    const result = await client.query(`
      SELECT id, matricule, nom, prenom, email, status, created_at
      FROM requests
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`Found ${result.rows.length} requests:`);
    result.rows.forEach(row => {
      console.log(`- ${row.prenom} ${row.nom} (${row.matricule}) - Status: ${row.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

updateTable();
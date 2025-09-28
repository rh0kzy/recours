const { Client } = require('pg');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check if environment variables are available
  if (!process.env.DATABASE_URL) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Database configuration missing' })
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Database connected successfully');

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'requests'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Table does not exist');
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify([])
      };
    }

    // Fetch data
    const query = `
      SELECT id, matricule, nom, prenom, email, telephone,
             specialite_actuelle, specialite_souhaitee, raison,
             status, admin_comment, submitted_at as created_at, reviewed_at, reviewed_by
      FROM requests
      ORDER BY submitted_at DESC
    `;
    console.log('Executing query...');
    const result = await client.query(query);
    console.log(`Found ${result.rows.length} requests`);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    console.error('Admin API Error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch requests',
        details: error.message,
        stack: error.stack
      })
    };
  } finally {
    try {
      await client.end();
      console.log('Database connection closed');
    } catch (e) {
      console.error('Error closing connection:', e);
    }
  }
};
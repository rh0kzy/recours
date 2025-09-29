const { Client } = require('pg');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check for required environment variables
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is missing');
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Database configuration missing' })
    };
  }

  let client;
  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Create the requests table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        matricule VARCHAR(50) NOT NULL,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telephone VARCHAR(20),
        specialite_actuelle VARCHAR(255) NOT NULL,
        specialite_souhaitee VARCHAR(255) NOT NULL,
        raison TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        admin_comment TEXT,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        reviewed_by VARCHAR(100),
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await client.query(createTableQuery);

    // Create indexes for better performance
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);',
      'CREATE INDEX IF NOT EXISTS idx_requests_submitted_at ON requests(submitted_at);',
      'CREATE INDEX IF NOT EXISTS idx_requests_matricule ON requests(matricule);'
    ];

    for (const indexQuery of indexQueries) {
      await client.query(indexQuery);
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Database setup completed successfully',
        table: 'requests table created/verified',
        indexes: 'Performance indexes created'
      })
    };
  } catch (error) {
    console.error('Database setup error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to setup database',
        details: error.message
      })
    };
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
};
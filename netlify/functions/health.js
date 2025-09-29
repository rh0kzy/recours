const { Client } = require('pg');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
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

  const status = {
    timestamp: new Date().toISOString(),
    environment: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasEmailConfig: !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD),
      nodeVersion: process.version
    },
    database: {
      connected: false,
      tableExists: false,
      error: null
    }
  };

  // Test database connection
  if (process.env.DATABASE_URL) {
    let client;
    try {
      client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });

      await client.connect();
      status.database.connected = true;

      // Check if requests table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'requests'
        ) as exists;
      `);
      
      status.database.tableExists = tableCheck.rows[0].exists;

    } catch (error) {
      status.database.error = error.message;
    } finally {
      if (client) {
        try {
          await client.end();
        } catch (e) {
          // Ignore close errors
        }
      }
    }
  }

  // Determine overall health
  const isHealthy = status.environment.hasDatabase && 
                   status.database.connected && 
                   status.database.tableExists;

  return {
    statusCode: isHealthy ? 200 : 503,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: isHealthy ? 'healthy' : 'unhealthy',
      ...status
    })
  };
};
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

  let client;
  try {
    // Check environment variables
    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'DATABASE_URL environment variable is missing',
          hasEnvVar: false
        })
      };
    }

    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL length:', process.env.DATABASE_URL.length);
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 20));

    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('Database connection successful!');

    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('Test query successful');

    // Check if requests table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'requests'
      ) as table_exists;
    `);

    // Get table info if it exists
    let tableInfo = null;
    if (tableCheck.rows[0].table_exists) {
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'requests' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      
      const countResult = await client.query('SELECT COUNT(*) as row_count FROM requests');
      
      tableInfo = {
        exists: true,
        columns: columnsResult.rows,
        rowCount: parseInt(countResult.rows[0].row_count)
      };
    } else {
      tableInfo = { exists: false };
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Database connection test successful',
        dbInfo: {
          currentTime: result.rows[0].current_time,
          version: result.rows[0].db_version
        },
        requestsTable: tableInfo,
        hasEnvVar: true
      })
    };
  } catch (error) {
    console.error('Database test error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Database connection failed',
        details: error.message,
        code: error.code,
        hasEnvVar: !!process.env.DATABASE_URL
      })
    };
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
};